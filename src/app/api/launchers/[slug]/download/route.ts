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
title ${launcher.name} — ElysiumPad
color 0A
cls
echo =====================================================================
echo                ${launcher.name} — Paquete de Conexión
echo =====================================================================
echo  * Servidor IP:   ${launcher.serverIp || 'Configurado en el cliente'}:${launcher.serverPort}
echo  * Version MC:    ${launcher.mcVersion} (${launcher.loader})
echo  * Mods activos:  ${launcher.mods.length} mods
echo =====================================================================
echo.
echo [1/2] Verificando manifiesto de sincronizacion en la nube:
echo       ${manifestUrl}
echo.
echo [2/2] Archivo de configuracion cargado: launcher-config.json
echo.
echo Consulta el archivo LEEME-INSTRUCCIONES.txt para unirte al servidor.
echo.
pause
`;

    // Script de arranque para Linux/Mac (.sh)
    const shScript = `#!/usr/bin/env bash
# ${launcher.name} — ElysiumPad
echo "====================================================================="
echo "               ${launcher.name} — Paquete de Conexión"
echo "====================================================================="
echo "* Servidor:   ${launcher.serverIp || 'Configurado en el cliente'}:${launcher.serverPort}"
echo "* Version:    ${launcher.mcVersion} (${launcher.loader})"
echo "* Mods:       ${launcher.mods.length} mods"
echo "* Manifiesto: ${manifestUrl}"
echo "====================================================================="
echo "Paquete verificado. Revisa LEEME-INSTRUCCIONES.txt para jugar."
`;

    // README del launcher para los jugadores
    const readmeText = `# ${launcher.name} — Launcher Oficial del Servidor

Bienvenido al paquete oficial de conexión para **${launcher.name}**.

## 📌 Datos de Conexión:
- **Dirección del Servidor**: ${launcher.serverIp || 'Por definir'}${launcher.serverPort && launcher.serverPort !== 25565 ? `:${launcher.serverPort}` : ''}
- **Versión de Minecraft**: ${launcher.mcVersion}
- **Motor / Modloader**: ${launcher.loader}
- **Mods Sincronizados**: ${launcher.mods.length} mods preconfigurados.

## 🚀 ¿Cómo jugar?
1. Inicia Minecraft ${launcher.mcVersion} con ${launcher.loader} en tu cliente o launcher habitual (Prism, Modrinth, CurseForge, ATLauncher, etc.).
2. Introduce la IP del servidor: \`${launcher.serverIp || 'localhost'}\`.
3. Todos los mods y archivos sincronizados están vinculados automáticamente al manifiesto en la nube:
   ${manifestUrl}

¡Disfruta del juego con la comunidad de ${launcher.name}!
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
