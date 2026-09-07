/**
 * Rate Limiter de alto rendimiento con ventana deslizante (Sliding Window)
 * Funciona en memoria sin dependencias externas y es compatible con Edge y Node runtime.
 * Detecta la IP real considerando proxies como Cloudflare (CF-Connecting-IP), Coolify y Traefik (X-Forwarded-For).
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Almacén en memoria indexado por clave (ej: "login:192.168.1.1")
const rateLimitMap = new Map<string, RateLimitRecord>();

// Limpieza periódica automática de registros caducados para evitar fugas de memoria
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000); // Cada 60 segundos
}

export interface RateLimitConfig {
  maxRequests: number; // Número máximo de peticiones permitidas
  windowSeconds: number; // Duración de la ventana en segundos
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Obtiene la dirección IP real del cliente detrás de proxies
 */
export function getClientIp(headers: Headers): string {
  // 1. Cloudflare CDN / Tunnel
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // 2. Proxies inversos estándar (Coolify, Traefik, Nginx)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Tomar la primera IP de la cadena (la IP original del cliente)
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  // 3. X-Real-IP
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

/**
 * Aplica el rate limit a una clave (IP + prefijo)
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetTime) {
    // Primera petición o ventana expirada
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetSeconds: config.windowSeconds,
    };
  }

  if (existing.count >= config.maxRequests) {
    // Límite excedido
    const resetSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds,
    };
  }

  // Incrementar contador
  existing.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - existing.count,
    resetSeconds,
  };
}

/**
 * Políticas de Rate Limiting según el tipo de recurso
 */
export const RateLimitPolicies = {
  // 1. Autenticación Crítica (Login y Registro) - Previene Fuerza Bruta
  auth: {
    maxRequests: 10, // Máx 10 intentos
    windowSeconds: 60, // por minuto
  },
  // 2. Subida de Archivos y Ping - Previene saturación de disco y escaneo de puertos
  resourceHeavy: {
    maxRequests: 20, // Máx 20 peticiones
    windowSeconds: 60, // por minuto
  },
  // 3. APIs Generales de Usuario
  apiGeneral: {
    maxRequests: 120, // Máx 120 peticiones
    windowSeconds: 60, // por minuto
  },
  // 4. Manifiesto público del Launcher - Permite que jugadores sincronicen fluidamente
  manifest: {
    maxRequests: 180, // Máx 180 peticiones
    windowSeconds: 60, // por minuto
  },
};
