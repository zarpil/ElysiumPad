import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

const UPDATES_DIR = path.join(process.cwd(), 'public', 'updates');

// GET /api/launcher/updates - Información y listado de archivos del canal de actualizaciones
export async function GET() {
  try {
    await fs.mkdir(UPDATES_DIR, { recursive: true });

    const latestYmlPath = path.join(UPDATES_DIR, 'latest.yml');
    let hasRelease = false;
    let version = '1.0.0';
    let releaseDate: string | null = null;
    let targetExe: string | null = null;
    let sha512: string | null = null;

    try {
      const content = await fs.readFile(latestYmlPath, 'utf-8');
      hasRelease = true;
      const vMatch = content.match(/version:\s*([^\s]+)/);
      if (vMatch) version = vMatch[1];

      const dateMatch = content.match(/releaseDate:\s*['"]?([^'"\n]+)/);
      if (dateMatch) releaseDate = dateMatch[1];

      const pathMatch = content.match(/path:\s*([^\s]+)/);
      if (pathMatch) targetExe = pathMatch[1];

      const shaMatch = content.match(/sha512:\s*([^\s]+)/);
      if (shaMatch) sha512 = shaMatch[1];
    } catch {
      hasRelease = false;
    }

    // Listar todos los archivos presentes en el canal
    const entries = await fs.readdir(UPDATES_DIR, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((e) => e.isFile())
        .map(async (e) => {
          const stats = await fs.stat(path.join(UPDATES_DIR, e.name));
          return {
            name: e.name,
            sizeBytes: stats.size,
            updatedAt: stats.mtime.toISOString(),
            url: `/api/launcher/updates/${e.name}`,
          };
        })
    );

    const hasExe = files.some((f) => f.name.toLowerCase().endsWith('.exe'));

    return NextResponse.json({
      success: true,
      service: 'ElysiumPad Launcher Update Service',
      hasRelease,
      currentLatestVersion: version,
      releaseDate,
      targetExe,
      sha512,
      hasExe,
      files,
      feedUrl: '/api/launcher/updates',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/launcher/updates - Subir nuevo archivo de actualización (Solo ADMIN)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acceso denegado. Se requiere rol ADMIN.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Archivo requerido' }, { status: 400 });
    }

    const allowedExts = ['.yml', '.yaml', '.exe', '.blockmap', '.zip', '.json'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { success: false, error: `Extensión no permitida para el canal de actualización: ${ext}` },
        { status: 400 }
      );
    }

    await fs.mkdir(UPDATES_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = path.basename(file.name);
    const targetPath = path.join(UPDATES_DIR, safeName);
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({
      success: true,
      message: `Archivo guardado correctamente: ${safeName}`,
      fileName: safeName,
      size: buffer.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/launcher/updates - Eliminar archivo de actualización (Solo ADMIN)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acceso denegado. Se requiere rol ADMIN.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json({ success: false, error: 'Nombre de archivo requerido' }, { status: 400 });
    }

    const safeName = path.basename(fileName);
    const targetPath = path.join(UPDATES_DIR, safeName);

    try {
      await fs.unlink(targetPath);
      return NextResponse.json({ success: true, message: `Archivo eliminado: ${safeName}` });
    } catch {
      return NextResponse.json({ success: false, error: 'Archivo no encontrado' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
