import { NextRequest, NextResponse } from 'next/server';
import net from 'net';

/**
 * Validador anti-SSRF (Server-Side Request Forgery)
 * Bloquea el escaneo de IPs privadas, localhost, servicios internos de Docker y metadata de nube
 */
function isDisallowedHost(host: string): boolean {
  const lower = host.toLowerCase().trim();

  // Hostnames internos prohibidos
  const blockedHostnames = [
    'localhost',
    'elysiumpad-db',
    'postgres',
    'redis',
    'database',
    'host.docker.internal',
    'gateway.docker.internal',
  ];
  if (blockedHostnames.includes(lower)) return true;

  // Bloquear IPs locales y privadas
  if (
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower.startsWith('10.') ||
    lower.startsWith('192.168.') ||
    lower.startsWith('169.254.') // AWS/Cloud Metadata IP
  ) {
    return true;
  }

  // Rango 172.16.0.0 - 172.31.255.255 (Redes Docker por defecto)
  const parts = lower.split('.').map(Number);
  if (parts.length === 4 && !parts.some(isNaN)) {
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
      return true;
    }
  }

  return false;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get('host');
  const port = Number(searchParams.get('port')) || 25565;

  if (!host) {
    return NextResponse.json({ success: false, error: 'Host requerido' }, { status: 400 });
  }

  // 1. Protección contra puertos inválidos o peligrosos
  if (port < 1024 || port > 65535) {
    return NextResponse.json(
      { success: false, error: 'Puerto fuera de rango permitido para servidores Minecraft (1024 - 65535)' },
      { status: 400 }
    );
  }

  // 2. Protección anti-SSRF
  if (isDisallowedHost(host)) {
    return NextResponse.json(
      { success: false, error: 'Dirección de host no permitida por políticas de seguridad de red.' },
      { status: 403 }
    );
  }

  return new Promise<NextResponse>((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2500);

    const startTime = Date.now();

    socket.connect(port, host, () => {
      const pingMs = Date.now() - startTime;
      socket.destroy();
      resolve(
        NextResponse.json({
          success: true,
          online: true,
          pingMs,
          host,
          port,
        })
      );
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(
        NextResponse.json({
          success: true,
          online: false,
          pingMs: null,
          host,
          port,
        })
      );
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(
        NextResponse.json({
          success: true,
          online: false,
          pingMs: null,
          host,
          port,
        })
      );
    });
  });
}
