import { NextRequest, NextResponse } from 'next/server';
import net from 'net';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get('host');
  const port = Number(searchParams.get('port')) || 25565;

  if (!host) {
    return NextResponse.json({ success: false, error: 'Host requerido' }, { status: 400 });
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
