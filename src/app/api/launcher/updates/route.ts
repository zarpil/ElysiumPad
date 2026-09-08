import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

const UPDATES_DIR = path.join(process.cwd(), 'public', 'updates');

// GET /api/launcher/updates - Información del canal de actualizaciones
export async function GET() {
  try {
    const latestYmlPath = path.join(UPDATES_DIR, 'latest.yml');
    let hasRelease = false;
    let version = '1.0.0';

    try {
      const content = await fs.readFile(latestYmlPath, 'utf-8');
      hasRelease = true;
      const match = content.match(/version:\s*([^\s]+)/);
      if (match) version = match[1];
    } catch {
      hasRelease = false;
    }

    return NextResponse.json({
      success: true,
      service: 'ElysiumPad Launcher Update Service',
      hasRelease,
      currentLatestVersion: version,
      feedUrl: '/api/launcher/updates',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/launcher/updates - Subir nuevo parche del launcher (Solo ADMIN)
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

    const allowedNames = ['.yml', '.yaml', '.exe', '.blockmap', '.zip'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedNames.includes(ext)) {
      return NextResponse.json(
        { success: false, error: `Extensión no permitida para actualizaciones: ${ext}` },
        { status: 400 }
      );
    }

    await fs.mkdir(UPDATES_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const targetPath = path.join(UPDATES_DIR, file.name);
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({
      success: true,
      message: `Archivo de actualización guardado con éxito: ${file.name}`,
      size: buffer.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
