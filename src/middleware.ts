import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit, RateLimitPolicies } from '@/lib/rate-limit';

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'elysiumpad-super-secret-key-change-in-prod-12345';
}

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  plan: string;
  exp?: number;
}

/**
 * Verificador criptográfico JWT seguro compatible con Edge y Node runtime (Web Crypto API)
 */
async function verifyJwt(token: string, secret: string): Promise<DecodedToken | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    // Normalizar base64url a base64 estándar con padding
    const base64Sig = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const paddedSig = base64Sig.padEnd(base64Sig.length + (4 - (base64Sig.length % 4)) % 4, '=');
    const binarySig = atob(paddedSig);
    const signature = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      signature[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!isValid) return null;

    // Normalizar payload base64url con padding y decodificar UTF-8
    const base64Payload = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(base64Payload.length + (4 - (base64Payload.length % 4)) % 4, '=');
    const binaryPayload = atob(paddedPayload);
    const payloadBytes = new Uint8Array(binaryPayload.length);
    for (let i = 0; i < binaryPayload.length; i++) {
      payloadBytes[i] = binaryPayload.charCodeAt(i);
    }
    const payloadStr = new TextDecoder().decode(payloadBytes);
    const payload: DecodedToken = JSON.parse(payloadStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null; // Token expirado
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const clientIp = getClientIp(req.headers);

  // =========================================================================
  // 1. SISTEMA DE RATE LIMITING (Anti-Fuerza Bruta y Anti-DoS)
  // =========================================================================
  if (pathname.startsWith('/api/')) {
    let rateConfig = RateLimitPolicies.apiGeneral;
    let rateKey = `general:${clientIp}`;
    let errorMessage = 'Límite de peticiones excedido. Espera unos segundos.';

    if (pathname === '/api/auth/login' || pathname === '/api/auth/register') {
      // Protección estricta contra fuerza bruta de contraseñas y spam de cuentas
      rateConfig = RateLimitPolicies.auth;
      rateKey = `auth:${clientIp}`;
      errorMessage = 'Demasiados intentos de acceso o registro. Espera 1 minuto antes de reintentar.';
    } else if (pathname === '/api/upload' || pathname === '/api/ping') {
      // Protección contra saturación de almacenamiento y escaneo de puertos
      rateConfig = RateLimitPolicies.resourceHeavy;
      rateKey = `heavy:${clientIp}`;
      errorMessage = 'Demasiadas operaciones consecutivas. Espera unos segundos.';
    } else if (pathname.startsWith('/api/v1/launchers/')) {
      // Manifiesto del launcher para jugadores
      rateConfig = RateLimitPolicies.manifest;
      rateKey = `manifest:${clientIp}`;
      errorMessage = 'Límite de sincronización alcanzado temporalmente.';
    }

    const rateResult = checkRateLimit(rateKey, rateConfig);

    if (!rateResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          retryAfterSeconds: rateResult.resetSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateResult.resetSeconds),
            'X-RateLimit-Limit': String(rateResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateResult.resetSeconds),
          },
        }
      );
    }
  }

  // =========================================================================
  // 2. CONTROL DE ACCESO Y AUTENTICACIÓN (RBAC)
  // =========================================================================
  const AUTH_COOKIE_NAME = 'elysium_token';
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await verifyJwt(token, getJwtSecret()) : null;
  const isAuthenticated = Boolean(user && user.userId);
  const isAdmin = Boolean(user && user.role === 'ADMIN');

  // Proteger Panel de Administración (/admin y /api/admin/*)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!isAuthenticated) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'No autenticado. Inicia sesión para acceder.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      if (token && !isAuthenticated) {
        res.cookies.delete(AUTH_COOKIE_NAME);
      }
      return res;
    }

    if (!isAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Acceso denegado. Se requieren privilegios de Administrador.' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Proteger Panel de Usuario y Perfil (/dashboard, /profile y /api/user/*)
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/api/user')
  ) {
    if (!isAuthenticated) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'No autenticado. Inicia sesión para continuar.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      if (token && !isAuthenticated) {
        res.cookies.delete(AUTH_COOKIE_NAME);
      }
      return res;
    }
  }

  // Si el usuario ya está autenticado, redirigir fuera de /login y /register
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    const redirectTarget = isAdmin ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(redirectTarget, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/api/:path*',
    '/login',
    '/register',
  ],
};
