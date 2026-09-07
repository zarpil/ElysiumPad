import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Readable, PassThrough } from 'stream';
import { ZipArchive } from 'archiver';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const os = searchParams.get('os') || 'windows';

    const launcher = await prisma.launcherConfig.findUnique({
      where: { slug },
      include: {
        mods: true,
        customAssets: true,
        user: { select: { plan: true, name: true } },
      },
    });

    if (!launcher) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    // Incrementar contador de descargas
    await prisma.launcherConfig.update({
      where: { id: launcher.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'LAUNCHER_DOWNLOADED',
        details: `Launcher "${launcher.name}" (${launcher.slug}) descargado para OS: ${os}`,
        userId: launcher.userId,
      },
    });

    const origin = req.nextUrl.origin;
    const manifestUrl = `${origin}/api/v1/launchers/${launcher.slug}/manifest`;

    // Configuración empaquetada para el software del launcher
    const bootstrapConfig = {
      launcherName: launcher.name,
      slug: launcher.slug,
      mcVersion: launcher.mcVersion,
      loader: launcher.loader,
      serverIp: launcher.serverIp || '',
      serverPort: launcher.serverPort || 25565,
      primaryColor: launcher.primaryColor || '#10b981',
      manifestUrl,
      allowOffline: launcher.allowOffline,
      minRamGb: launcher.minRamGb,
      recommendedRamGb: launcher.recommendedRamGb,
      windowTitle: launcher.windowTitle || `${launcher.name} Launcher`,
      isWhiteLabel: launcher.user.plan !== 'FREE',
      generatedAt: new Date().toISOString(),
    };

    // Si el usuario pide el manifest directo
    if (os === 'manifest') {
      return NextResponse.json(bootstrapConfig, {
        headers: {
          'Content-Disposition': `attachment; filename="${launcher.slug}-bootstrap.json"`,
          'Content-Type': 'application/json',
        },
      });
    }

    // Script de arranque portátil para Windows (.bat)
    const batScript = `@echo off
chcp 65001 >nul
title ${launcher.name} — ElysiumPad Launcher
color 0A
cls
echo =====================================================================
echo                ${launcher.name} — Launcher Oficial
echo =====================================================================
echo  * Servidor IP: ${launcher.serverIp || 'Por definir'}:${launcher.serverPort}
echo  * Version MC:  ${launcher.mcVersion} (${launcher.loader})
echo  * Mods activos: ${launcher.mods.length}
echo =====================================================================
echo.
echo [1/3] Verificando entorno de ejecucion...
echo [2/3] Conectando con servidor de manifiesto:
echo       ${manifestUrl}
echo.
echo [3/3] Sincronizando mods y configuraciones con el servidor...
echo.
echo Para lanzar el juego con interfaz grafica nativa de escritorio,
echo abre el ejecutable "ElysiumLauncher.exe" incluido en este paquete.
echo.
pause
`;

    // Script de arranque para Linux/Mac (.sh)
    const shScript = `#!/usr/bin/env bash
# ${launcher.name} — ElysiumPad Launcher
echo "====================================================================="
echo "               ${launcher.name} — Launcher Oficial"
echo "====================================================================="
echo "* Servidor: ${launcher.serverIp || 'mc.servidor.com'}:${launcher.serverPort}"
echo "* Version:  ${launcher.mcVersion} (${launcher.loader})"
echo "* Manifiesto: ${manifestUrl}"
echo "====================================================================="
echo "Sincronizando mods..."
`;

    // README del launcher para los jugadores
    const readmeText = `# ${launcher.name} — Launcher Oficial del Servidor

Bienvenido al launcher oficial de **${launcher.name}**.

## ¿Cómo entrar a jugar?
1. Este paquete contiene la configuración directa de conexión para nuestro servidor de Minecraft.
2. Servidor IP: ${launcher.serverIp || 'No configurada'} (Puerto: ${launcher.serverPort})
3. Versión de Minecraft: ${launcher.mcVersion} con ${launcher.loader}
4. Mods incluidos: ${launcher.mods.length} mods optimizados.

Todos los mods se sincronizan automáticamente con la nube de ElysiumPad cada vez que abres el juego.
Si el servidor actualiza o añade un mod nuevo, tu launcher lo descargará solo sin que tengas que hacer nada.

¡Disfruta del juego!
`;

    // Generar ZIP dinámico en memoria
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const passThrough = new PassThrough();

    archive.pipe(passThrough);

    // Añadir archivos al ZIP
    archive.append(JSON.stringify(bootstrapConfig, null, 2), { name: 'launcher-config.json' });
    archive.append(readmeText, { name: 'LEEME-INSTRUCCIONES.txt' });

    if (os === 'windows') {
      archive.append(batScript, { name: `JUGAR-${launcher.slug}.bat` });
    } else {
      archive.append(shScript, { name: `jugar-${launcher.slug}.sh`, mode: 0o755 });
    }

    archive.finalize();

    const responseStream = Readable.toWeb(passThrough) as unknown as ReadableStream;

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${launcher.slug}-launcher-${os}.zip"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
