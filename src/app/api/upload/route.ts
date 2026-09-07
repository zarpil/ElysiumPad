import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isR2Configured, r2Client, getAssetCacheControl } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// Extensiones estrictamente permitidas por categoría
const ALLOWED_IMAGE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico'];
const ALLOWED_ASSET_EXTENSIONS = [
  '.jar',
  '.zip',
  '.json',
  '.properties',
  '.toml',
  '.ini',
  '.txt',
  '.cfg',
  '.yml',
  '.yaml',
  '.snbt',
  '.mcmeta',
  '.lang',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_ASSET_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawAssetType = (formData.get('type') as string) || 'asset';
    const rawLauncherSlug = (formData.get('slug') as string) || 'common';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Archivo requerido' }, { status: 400 });
    }

    // 1. Sanitización estricta contra Path Traversal
    const cleanSlug = rawLauncherSlug.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'common';
    const cleanAssetType = rawAssetType.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'asset';

    const originalName = file.name || 'file';
    const extension = path.extname(originalName).toLowerCase();

    // 2. Validación de extensiones permitidas (Whitelist)
    const isImageUpload = ['logo', 'banner', 'news', 'adbanner', 'image'].includes(cleanAssetType.toLowerCase());
    const allowedList = isImageUpload ? ALLOWED_IMAGE_EXTENSIONS : [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_ASSET_EXTENSIONS];

    if (!extension || !allowedList.includes(extension)) {
      return NextResponse.json(
        {
          success: false,
          error: `Extensión de archivo no permitida (${extension}). Extensiones válidas: ${allowedList.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 3. Validación de límite de tamaño
    const maxSize = isImageUpload ? MAX_IMAGE_SIZE : MAX_ASSET_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `El archivo supera el límite de tamaño permitido (${Math.round(maxSize / (1024 * 1024))} MB)`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const fileSize = buffer.length;

    const cleanBaseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const finalKey = `${cleanSlug}/${cleanAssetType}/${cleanBaseName}-${sha256.substring(0, 8)}${extension}`;
    const contentType = file.type || (extension === '.jar' ? 'application/java-archive' : 'application/octet-stream');
    const cacheControl = getAssetCacheControl(finalKey, contentType);

    // 4. Subida a Cloudflare R2
    if (isR2Configured()) {
      const bucket = process.env.R2_BUCKET_NAME || 'minecraft-launchers';
      const publicDomain = (process.env.R2_PUBLIC_DOMAIN || 'https://pub-r2.elysiumpad.local').replace(/\/$/, '');

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: finalKey,
        Body: buffer,
        ContentType: contentType,
        CacheControl: cacheControl,
      });

      await r2Client.send(command);
      const publicUrl = `${publicDomain}/${finalKey}`;

      return NextResponse.json({
        success: true,
        storage: 'r2',
        url: publicUrl,
        key: finalKey,
        fileSize,
        sha1,
        sha256,
        cacheControl,
      });
    }

    // 5. Almacenamiento Local Seguro
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', cleanSlug, cleanAssetType);
    await fs.mkdir(uploadsDir, { recursive: true });

    const localFileName = `${cleanBaseName}-${sha256.substring(0, 8)}${extension}`;
    const filePath = path.join(uploadsDir, localFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${cleanSlug}/${cleanAssetType}/${localFileName}`;

    return NextResponse.json({
      success: true,
      storage: 'local',
      url: publicUrl,
      key: finalKey,
      fileSize,
      sha1,
      sha256,
      cacheControl,
    });
  } catch (error: any) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
