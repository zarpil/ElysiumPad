/**
 * Utilidades de optimización de imágenes en el cliente (Browser Canvas API)
 * Convierte automáticamente imágenes (PNG/JPEG) a formato WebP comprimido y redimensionado,
 * reduciendo el peso de logos y banners en hasta un 90% antes de enviarlos a Cloudflare R2.
 */

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (default 0.85)
  format?: 'image/webp' | 'image/jpeg';
  targetFileName?: string;
}

export interface OptimizationResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  optimizedSize: number;
  savingsBytes: number;
  savingsPercent: number;
  width: number;
  height: number;
  sha256?: string;
}

/**
 * Calcula el hash SHA-256 de un ArrayBuffer usando Web Crypto API nativa
 */
export async function calculateSha256(buffer: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return '';
}

/**
 * Optimiza una imagen: redimensiona proporcionalmente si supera los límites
 * y la convierte a WebP con compresión de alta fidelidad.
 */
export async function optimizeImage(
  input: File | Blob,
  options: OptimizeOptions = {}
): Promise<OptimizationResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'image/webp',
    targetFileName = 'optimized.webp',
  } = options;

  const originalSize = input.size;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(input);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calcular nueva resolución manteniendo relación de aspecto
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto 2D del Canvas'));
        return;
      }

      // Mejorar suavizado para downscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Fallo al exportar imagen optimizada'));
            return;
          }

          const arrayBuffer = await blob.arrayBuffer();
          const sha256 = await calculateSha256(arrayBuffer);

          const finalFileName = targetFileName.endsWith('.webp')
            ? targetFileName
            : `${targetFileName.replace(/\.[^/.]+$/, '')}.webp`;

          const optimizedFile = new File([blob], finalFileName, {
            type: format,
            lastModified: Date.now(),
          });

          const optimizedSize = optimizedFile.size;
          const savingsBytes = Math.max(0, originalSize - optimizedSize);
          const savingsPercent = originalSize > 0
            ? Math.round((savingsBytes / originalSize) * 100)
            : 0;

          const previewUrl = URL.createObjectURL(optimizedFile);

          resolve({
            file: optimizedFile,
            previewUrl,
            originalSize,
            optimizedSize,
            savingsBytes,
            savingsPercent,
            width,
            height,
            sha256,
          });
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('El archivo proporcionado no es una imagen válida o está corrupto'));
    };

    img.src = objectUrl;
  });
}

/**
 * Ajustes preestablecidos de optimización recomendados según el caso de uso
 */
export const ImageOptimizationPresets = {
  logo: {
    maxWidth: 256,
    maxHeight: 256,
    quality: 0.9,
    format: 'image/webp' as const,
  },
  banner: {
    maxWidth: 1920,
    maxHeight: 640,
    quality: 0.85,
    format: 'image/webp' as const,
  },
  newsImage: {
    maxWidth: 1280,
    maxHeight: 720,
    quality: 0.82,
    format: 'image/webp' as const,
  },
  adBanner: {
    maxWidth: 1200,
    maxHeight: 300,
    quality: 0.85,
    format: 'image/webp' as const,
  },
};
