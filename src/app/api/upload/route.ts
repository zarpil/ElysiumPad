import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isR2Configured, generateUploadPresignedUrl, r2Client, getAssetCacheControl } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const assetType = (formData.get('type') as string) || 'asset'; // 'logo' | 'banner' | 'mod' | 'news'
    const launcherSlug = (formData.get('slug') as string) || 'common';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Archivo requerido' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const fileSize = buffer.length;

    // Normalizar nombre de archivo seguro
    const originalName = file.name || 'file';
    const extension = path.extname(originalName).toLowerCase() || (file.type === 'image/webp' ? '.webp' : '');
    const cleanBaseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalKey = `${launcherSlug}/${assetType}/${cleanBaseName}-${sha256.substring(0, 8)}${extension}`;
    const contentType = file.type || 'application/octet-stream';
    const cacheControl = getAssetCacheControl(finalKey, contentType);

    // 1. Si Cloudflare R2 está configurado, subir directamente a R2
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

    // 2. Fallback de Almacenamiento Local (Zero-Config / Auto-Hospedado)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', launcherSlug, assetType);
    await fs.mkdir(uploadsDir, { recursive: true });

    const localFileName = `${cleanBaseName}-${sha256.substring(0, 8)}${extension}`;
    const filePath = path.join(uploadsDir, localFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${launcherSlug}/${assetType}/${localFileName}`;

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
