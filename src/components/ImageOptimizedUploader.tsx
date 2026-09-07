'use client';

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, Image as ImageIcon, Sparkles, Loader2, X } from 'lucide-react';
import { optimizeImage, ImageOptimizationPresets, OptimizationResult } from '@/lib/image-optimizer';

interface ImageOptimizedUploaderProps {
  label: string;
  preset: 'logo' | 'banner' | 'newsImage' | 'adBanner';
  currentImageUrl?: string;
  onImageOptimized: (result: { file: File; previewUrl: string; sha256?: string; publicUrl?: string }) => void;
  className?: string;
  helperText?: string;
}

export function ImageOptimizedUploader({
  label,
  preset,
  currentImageUrl,
  onImageOptimized,
  className = '',
  helperText,
}: ImageOptimizedUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState<{
    originalKb: number;
    optimizedKb: number;
    savingsPercent: number;
  } | null>(null);
  const [preview, setPreview] = useState<string>(currentImageUrl || '');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetConfig = ImageOptimizationPresets[preset];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (PNG, JPG o WEBP)');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const result: OptimizationResult = await optimizeImage(file, {
        maxWidth: presetConfig.maxWidth,
        maxHeight: presetConfig.maxHeight,
        quality: presetConfig.quality,
        format: 'image/webp',
        targetFileName: `${preset}-${Date.now()}.webp`,
      });

      setPreview(result.previewUrl);
      setOptimizationStats({
        originalKb: Math.round(result.originalSize / 1024),
        optimizedKb: Math.round(result.optimizedSize / 1024),
        savingsPercent: result.savingsPercent,
      });

      onImageOptimized({
        file: result.file,
        previewUrl: result.previewUrl,
        sha256: result.sha256,
      });
    } catch (err: any) {
      setError(err.message || 'Error al procesar y optimizar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    setOptimizationStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageOptimized({ file: null as any, previewUrl: '', publicUrl: '' });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          {label}
        </label>
        <span className="text-[10px] text-slate-500 font-mono">
          Máx {presetConfig.maxWidth}×{presetConfig.maxHeight}px • WebP
        </span>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg transition-all cursor-pointer overflow-hidden group ${
          preview
            ? 'border-emerald-500/40 bg-slate-900/60'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70'
        } ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative p-3 flex items-center gap-4">
            <div
              className={`relative overflow-hidden rounded border border-slate-700 bg-slate-950 flex-shrink-0 flex items-center justify-center ${
                preset === 'logo' ? 'w-16 h-16' : 'w-28 h-16'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Vista previa optimizada"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  WebP Optimizado
                </span>
                {optimizationStats && optimizationStats.savingsPercent > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                    <Sparkles className="w-2.5 h-2.5" />
                    -{optimizationStats.savingsPercent}% peso
                  </span>
                )}
              </div>

              {optimizationStats ? (
                <p className="text-[11px] text-slate-400 font-mono">
                  {optimizationStats.originalKb} KB ➔ <span className="text-emerald-300 font-semibold">{optimizationStats.optimizedKb} KB</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">Clic para reemplazar imagen</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              title="Eliminar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6 text-center">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                <p className="text-xs text-slate-300">Optimizando y convirtiendo a WebP...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 group-hover:text-emerald-400 group-hover:border-slate-600 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                    Haz clic para seleccionar o arrastra una imagen
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    PNG, JPG o WEBP. Se optimizará y comprimirá automáticamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}

      {error && (
        <p className="text-[11px] text-rose-400 font-medium">{error}</p>
      )}
    </div>
  );
}
