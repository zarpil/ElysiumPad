import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getClientIp } from '@/lib/rate-limit';

const UPDATES_DIR = path.join(process.cwd(), 'public', 'updates');

// Helper para asegurar la existencia del directorio con manejo de permisos
async function ensureUpdatesDir() {
  try {
    await fs.mkdir(UPDATES_DIR, { recursive: true });
  } catch (err: any) {
    if (err.code !== 'EEXIST') {
      console.error('[Updates Dir Error]', err);
      throw err;
    }
  }
}

// GET /api/launcher/updates - Información pública del canal para que el launcher consulte parches
export async function GET() {
  try {
    await ensureUpdatesDir();

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
    let files: Array<{ name: string; sizeBytes: number; updatedAt: string; url: string }> = [];
    try {
      const entries = await fs.readdir(UPDATES_DIR, { withFileTypes: true });
      files = await Promise.all(
        entries
          .filter((e) => e.isFile())
          .map(async (e) => {
            const stats = await fs.stat(path.join(UPDATES_DIR, e.name));
            return {
              name: e.name,
              sizeBytes: stats.size,
              updatedAt: stats.mtime.toISOString(),
              url: `/api/launcher/updates/${encodeURIComponent(e.name)}`,
            };
          })
      );
    } catch {
      files = [];
    }

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

// POST /api/launcher/updates - Subir nuevo archivo de actualización
// SEGURIDAD REFORZADA:
// 1. Verificación DB del usuario autenticado (SuperAdmin no suspendido).
// 2. Doble factor de autorización: Contraseña actual del Admin o token LAUNCHER_RELEASE_KEY.
// 3. Whitelist estricta de nombres y extensiones permitidas (.yml, .exe, .blockmap, .zip).
// 4. Inspección de Magic Bytes para ejecutables PE de Windows (cabecera MZ obligatoria).
// 5. Límite estricto de tamaño (250 MB).
// 6. Registro inmutable en auditoría con hash SHA-256 e IP.
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req.headers);

  try {
    const authUser = await getCurrentUser();
    if (!authUser || !authUser.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado. Inicia sesión como administrador.' },
        { status: 401 }
      );
    }

    // 1. Verificación en tiempo real contra la base de datos (rechaza JWTs desactualizados o cuentas suspendidas)
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, role: true, status: true, passwordHash: true },
    });

    if (!dbUser || dbUser.role !== 'ADMIN' || dbUser.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: Se requieren privilegios de SuperAdmin verificados.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const adminPassword = (formData.get('adminPassword') as string) || req.headers.get('x-admin-password');
    const releaseKey = (formData.get('releaseKey') as string) || req.headers.get('x-release-key');

    // 2. Verificación de segundo factor de seguridad para el canal de distribución de software
    let isAuthorized = false;
    const configuredKey = process.env.LAUNCHER_RELEASE_KEY;

    if (configuredKey && releaseKey && releaseKey === configuredKey) {
      isAuthorized = true;
    } else if (adminPassword && dbUser.passwordHash) {
      const passwordValid = await bcrypt.compare(adminPassword, dbUser.passwordHash);
      if (passwordValid) isAuthorized = true;
    }

    if (!isAuthorized) {
      // Registrar intento no autorizado en auditoría
      await prisma.auditLog.create({
        data: {
          action: 'SECURITY_ALERT_UNAUTHORIZED_LAUNCHER_UPDATE',
          details: `Intento de subir archivos al canal del launcher rechazado por falta de confirmación de clave/contraseña desde IP: ${clientIp} (Usuario: ${dbUser.email})`,
          userId: dbUser.id,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Confirmación de seguridad requerida: Para proteger a los jugadores contra ataques a la cadena de suministro, debes introducir tu contraseña de administrador o el token LAUNCHER_RELEASE_KEY.',
        },
        { status: 403 }
      );
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'Archivo requerido' }, { status: 400 });
    }

    // 3. Sanitización y validación estricta de nombres de archivo
    const safeName = path.basename(file.name).trim();

    // Rechazar nombres sospechosos con caracteres no imprimibles o intentos de path traversal
    if (!/^[a-zA-Z0-9_\-\. ]+$/.test(safeName) || safeName.includes('..')) {
      return NextResponse.json(
        { success: false, error: 'Nombre de archivo inválido o contiene caracteres sospechosos.' },
        { status: 400 }
      );
    }

    const ext = path.extname(safeName).toLowerCase();
    const allowedExtensions = ['.yml', '.yaml', '.exe', '.blockmap', '.zip'];

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Extensión "${ext}" bloqueada por seguridad. Solo se admiten archivos del instalador (.exe, .blockmap, latest.yml, .zip).`,
        },
        { status: 400 }
      );
    }

    // 4. Límite de tamaño máximo por archivo (250 MB)
    const MAX_SIZE = 250 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo excede el tamaño máximo permitido de 250 MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 5. Inspección profunda de Magic Bytes (Integridad de archivos PE de Windows)
    if (ext === '.exe') {
      if (buffer.length < 2 || buffer[0] !== 0x4d || buffer[1] !== 0x5a) {
        return NextResponse.json(
          {
            success: false,
            error: 'Seguridad: El archivo no es un ejecutable genuino de Windows PE (Cabecera MZ ausente).',
          },
          { status: 400 }
        );
      }
    }

    if (safeName === 'latest.yml' || ext === '.yml' || ext === '.yaml') {
      const textContent = buffer.toString('utf-8');
      if (!textContent.includes('version:') && !textContent.includes('files:')) {
        return NextResponse.json(
          {
            success: false,
            error: 'El archivo latest.yml no tiene el formato estándar de manifiesto de electron-builder.',
          },
          { status: 400 }
        );
      }
    }

    // 6. Almacenamiento seguro en disco
    await ensureUpdatesDir();
    const targetPath = path.join(UPDATES_DIR, safeName);
    await fs.writeFile(targetPath, buffer);

    // 7. Cálculo de huella criptográfica SHA-256 y registro en auditoría
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    await prisma.auditLog.create({
      data: {
        action: 'LAUNCHER_UPDATE_PUBLISHED',
        details: `Archivo ${safeName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB) publicado con éxito en el canal del launcher por ${dbUser.email} (IP: ${clientIp}, SHA256: ${sha256})`,
        userId: dbUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Archivo publicado con éxito: ${safeName}`,
      fileName: safeName,
      size: buffer.length,
      sha256,
    });
  } catch (error: any) {
    console.error('[Launcher Update Upload Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/launcher/updates - Eliminar archivo del canal de actualización
export async function DELETE(req: NextRequest) {
  const clientIp = getClientIp(req.headers);

  try {
    const authUser = await getCurrentUser();
    if (!authUser || !authUser.id) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, role: true, status: true, passwordHash: true },
    });

    if (!dbUser || dbUser.role !== 'ADMIN' || dbUser.status === 'SUSPENDED') {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');
    const adminPassword = searchParams.get('adminPassword') || req.headers.get('x-admin-password');
    const releaseKey = searchParams.get('releaseKey') || req.headers.get('x-release-key');

    // Confirmación de seguridad
    let isAuthorized = false;
    const configuredKey = process.env.LAUNCHER_RELEASE_KEY;
    if (configuredKey && releaseKey && releaseKey === configuredKey) {
      isAuthorized = true;
    } else if (adminPassword && dbUser.passwordHash) {
      const passwordValid = await bcrypt.compare(adminPassword, dbUser.passwordHash);
      if (passwordValid) isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Se requiere confirmar tu contraseña de administrador para eliminar binarios del canal.' },
        { status: 403 }
      );
    }

    if (!fileName) {
      return NextResponse.json({ success: false, error: 'Nombre de archivo requerido' }, { status: 400 });
    }

    const safeName = path.basename(fileName).trim();
    const targetPath = path.join(UPDATES_DIR, safeName);

    try {
      await fs.unlink(targetPath);

      await prisma.auditLog.create({
        data: {
          action: 'LAUNCHER_UPDATE_DELETED',
          details: `Archivo ${safeName} eliminado del canal del launcher por ${dbUser.email} (IP: ${clientIp})`,
          userId: dbUser.id,
        },
      });

      return NextResponse.json({ success: true, message: `Archivo eliminado: ${safeName}` });
    } catch {
      return NextResponse.json({ success: false, error: 'Archivo no encontrado' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
