import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'minecraft-launchers';
const R2_PUBLIC_DOMAIN = (process.env.R2_PUBLIC_DOMAIN || 'https://pub-r2.elysiumpad.local').replace(/\/$/, '');

export function isR2Configured(): boolean {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Retorna las directivas de cache HTTP óptimas según el tipo de archivo.
 * Para assets inmutables (.jar de mods con hash y WebP optimizados),
 * se establece cache de 1 año (31536000s) e immutable para que Cloudflare CDN
 * los almacene en el edge con coste de transferencia 0.
 */
export function getAssetCacheControl(fileName: string, contentType: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.jar') || contentType === 'application/java-archive') {
    return 'public, max-age=31536000, immutable';
  }
  if (lower.endsWith('.webp') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return 'public, max-age=31536000, immutable';
  }
  if (lower.endsWith('.json')) {
    return 'public, max-age=60, stale-while-revalidate=300';
  }
  return 'public, max-age=86400';
}

/**
 * Genera una URL prefirmada para subida directa desde el navegador a Cloudflare R2
 * con cabeceras de cache inmutable automáticas.
 */
export async function generateUploadPresignedUrl(
  key: string,
  contentType: string,
  customCacheControl?: string
) {
  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 no está configurado. Define R2_ACCOUNT_ID, R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY.');
  }

  const cacheControl = customCacheControl || getAssetCacheControl(key, contentType);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    CacheControl: cacheControl,
  });

  // URL válida por 15 minutos para subir directo desde el navegador
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
  const publicUrl = `${R2_PUBLIC_DOMAIN}/${key}`;

  return { uploadUrl, publicUrl, key, cacheControl };
}

export async function deleteR2Object(key: string) {
  if (!isR2Configured()) {
    return null;
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  return await r2Client.send(command);
}
