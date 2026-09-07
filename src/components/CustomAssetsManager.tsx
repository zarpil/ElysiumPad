'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  UploadCloud,
  Folder,
  Settings,
  Palette,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Download,
  Copy,
  Check,
  Search,
  Lock,
  Crown,
  HardDrive,
  Box,
  FileText,
  X,
} from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';

interface CustomAsset {
  id: string;
  fileName: string;
  assetType: string;
  fileSize: number;
  sha1?: string | null;
  downloadUrl?: string;
  createdAt?: string | Date;
}

interface CustomAssetsManagerProps {
  launcherSlug: string;
  isFree: boolean;
  assets: CustomAsset[];
  onAssetChanged: () => void;
  onUpgradeOpen?: () => void;
}

type DestinationFolder = 'mods' | 'config' | 'shaderpacks' | 'resourcepacks' | 'custom';

export function CustomAssetsManager({
  launcherSlug,
  isFree,
  assets = [],
  onAssetChanged,
  onUpgradeOpen,
}: CustomAssetsManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [destFolder, setDestFolder] = useState<DestinationFolder>('mods');
  const [customPath, setCustomPath] = useState('');
  const [assetType, setAssetType] = useState('MOD');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MOD' | 'CONFIG' | 'SHADERS' | 'OTHER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calcula la ruta final destino calculada
  const finalTargetPath = useMemo(() => {
    if (!selectedFile) return '';
    if (destFolder === 'custom') {
      return customPath.trim() || selectedFile.name;
    }
    return `${destFolder}/${selectedFile.name}`;
  }, [selectedFile, destFolder, customPath]);

  // Inteligencia de auto-clasificación de archivos
  function processFileSelection(file: File) {
    setSelectedFile(file);
    setError(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (ext === 'jar') {
      setDestFolder('mods');
      setAssetType('MOD');
      setCustomPath(`mods/${file.name}`);
    } else if (['toml', 'json', 'properties', 'ini', 'txt', 'cfg', 'yml', 'yaml'].includes(ext)) {
      setDestFolder('config');
      setAssetType('CONFIG');
      setCustomPath(`config/${file.name}`);
    } else if (ext === 'zip') {
      if (file.name.toLowerCase().includes('shader')) {
        setDestFolder('shaderpacks');
        setAssetType('SHADER');
      } else {
        setDestFolder('resourcepacks');
        setAssetType('RESOURCEPACK');
      }
      setCustomPath(`${destFolder}/${file.name}`);
    } else {
      setDestFolder('custom');
      setAssetType('CUSTOM');
      setCustomPath(file.name);
    }
  }

  // Drag & drop handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileSelection(e.dataTransfer.files[0]);
    }
  }

  // Manejador del input de archivos normal
  function handleNativeFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processFileSelection(file);
    }
  }

  // Trigger file picker con filtro opcional
  function openPicker(accept?: string) {
    if (fileInputRef.current) {
      if (accept) {
        fileInputRef.current.accept = accept;
      } else {
        fileInputRef.current.removeAttribute('accept');
      }
      fileInputRef.current.click();
    }
  }

  // Subir archivo al backend
  async function handleUploadAndRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedFile) {
      setError('Por favor selecciona o arrastra un archivo.');
      return;
    }

    if (isFree) {
      setError('La sincronización de archivos propios requiere una cuenta PRO o LIFETIME.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Subir archivo a través de /api/upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', assetType.toLowerCase());
      formData.append('slug', launcherSlug);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Error al almacenar el archivo');
      }

      // 2. Asociar el archivo al launcher
      const assetRes = await fetch(`/api/launchers/${launcherSlug}/custom-assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: finalTargetPath,
          assetType,
          fileSize: uploadData.fileSize,
          sha1: uploadData.sha1,
          contentType: selectedFile.type,
        }),
      });

      const assetData = await assetRes.json();
      if (!assetData.success) {
        throw new Error(assetData.error || 'Error al asociar el archivo al launcher');
      }

      // Resetear estado
      setSelectedFile(null);
      setCustomPath('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccessMsg(`¡${selectedFile.name} se ha subido y sincronizado con éxito!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      onAssetChanged();
    } catch (err: any) {
      setError(err.message || 'Error inesperado durante la subida');
    } finally {
      setUploading(false);
    }
  }

  // Eliminar archivo
  async function handleDeleteAsset(assetId: string) {
    setDeletingId(assetId);
    try {
      const res = await fetch(`/api/launchers/${launcherSlug}/custom-assets?assetId=${assetId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onAssetChanged();
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar archivo');
    } finally {
      setDeletingId(null);
    }
  }

  // Copiar SHA1 al portapapeles
  async function copySha(sha1: string, id: string) {
    const success = await copyToClipboard(sha1);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  // Formatear bytes
  function formatBytes(bytes: number) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Métricas calculadas
  const totalBytes = useMemo(() => {
    return assets.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  }, [assets]);

  const modsCount = useMemo(() => {
    return assets.filter((a) => a.assetType === 'MOD' || a.fileName.startsWith('mods/')).length;
  }, [assets]);

  const configsCount = useMemo(() => {
    return assets.filter((a) => a.assetType === 'CONFIG' || a.fileName.startsWith('config/')).length;
  }, [assets]);

  const shadersCount = useMemo(() => {
    return assets.filter(
      (a) =>
        a.assetType === 'SHADER' ||
        a.assetType === 'RESOURCEPACK' ||
        a.fileName.startsWith('shaderpacks/') ||
        a.fileName.startsWith('resourcepacks/')
    ).length;
  }, [assets]);

  // Filtrado de archivos en la vista
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'MOD') {
        return item.assetType === 'MOD' || item.fileName.startsWith('mods/');
      }
      if (activeFilter === 'CONFIG') {
        return item.assetType === 'CONFIG' || item.fileName.startsWith('config/');
      }
      if (activeFilter === 'SHADERS') {
        return (
          item.assetType === 'SHADER' ||
          item.assetType === 'RESOURCEPACK' ||
          item.fileName.startsWith('shaderpacks/') ||
          item.fileName.startsWith('resourcepacks/')
        );
      }
      if (activeFilter === 'OTHER') {
        return (
          item.assetType !== 'MOD' &&
          item.assetType !== 'CONFIG' &&
          item.assetType !== 'SHADER' &&
          item.assetType !== 'RESOURCEPACK' &&
          !item.fileName.startsWith('mods/') &&
          !item.fileName.startsWith('config/') &&
          !item.fileName.startsWith('shaderpacks/') &&
          !item.fileName.startsWith('resourcepacks/')
        );
      }
      return true;
    });
  }, [assets, activeFilter, searchQuery]);

  // Obtener icono apropiado para cada archivo
  function getFileIcon(fileName: string, type: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'jar' || type === 'MOD') {
      return <Box className="w-4 h-4 text-emerald-400" />;
    }
    if (['toml', 'json', 'properties', 'ini', 'cfg', 'txt', 'yml'].includes(ext || '') || type === 'CONFIG') {
      return <Settings className="w-4 h-4 text-amber-400" />;
    }
    if (ext === 'zip' || type === 'SHADER' || type === 'RESOURCEPACK') {
      return <Palette className="w-4 h-4 text-purple-400" />;
    }
    return <FileText className="w-4 h-4 text-cyan-400" />;
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for file picker */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleNativeFileInput}
      />

      {/* Header Hub con Storage Meter & Status */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Archivos & Configuraciones del Launcher
                  {isFree ? (
                    <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase font-extrabold tracking-wider flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> PRO Exclusivo
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase font-extrabold tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Sincronización R2 Activa
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  Sincroniza archivos en el directorio del cliente Minecraft con caché inmutable y verificación criptográfica SHA-1.
                </p>
              </div>
            </div>
          </div>

          {/* Cloud Storage Meter */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 min-w-[260px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                Almacenamiento Cloud R2
              </span>
              <span className="font-bold text-white font-mono">{formatBytes(totalBytes)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(4, (totalBytes / (500 * 1024 * 1024)) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>{assets.length} archivos sincronizados</span>
              <span>Límite: {isFree ? '0 MB (Free)' : '500 MB (PRO)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Si es usuario FREE, mostrar showcase interactivo con CTA de Upgrade */}
      {isFree ? (
        <div className="bg-gradient-to-b from-[#141a29] to-[#0d121d] border border-amber-500/20 rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
            <Crown className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-lg font-black text-white">Desbloquea la Sincronización Cloud R2</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Permite a tus jugadores descargar automáticamente tus mods privados, archivos de configuración
              personalizados (como menús, botones, binds, voice chat) y shaders directamente desde el launcher.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Box className="w-4 h-4 text-emerald-400" />
                <span>Mods Privados (.jar)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sube mods propios que no están en CurseForge ni Modrinth a la carpeta <code className="text-white">mods/</code>.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Configs del Servidor</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Asegura que todos jueguen con la misma config de voz, gráficos y menús en <code className="text-white">config/</code>.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Shaders & Texturas</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sincroniza paquetes <code className="text-white">.zip</code> de shaders y recursos preconfigurados.
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={onUpgradeOpen}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Desbloquear Archivos & Configs con PRO</span>
            </button>
          </div>
        </div>
      ) : (
        /* Formulario de Subida Intuitivo (Drag & Drop + Presets) */
        <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                Subir y Sincronizar Archivo
              </h4>
              <p className="text-xs text-slate-400">
                Arrastra tu archivo o usa los accesos rápidos. Detectamos automáticamente la carpeta de Minecraft correspondiente.
              </p>
            </div>

            {/* Accesos rápidos por categoría */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => openPicker('.jar')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-slate-700/60"
              >
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                Mod (.jar)
              </button>
              <button
                type="button"
                onClick={() => openPicker('.toml,.json,.properties,.txt,.cfg,.ini,.yml')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-slate-700/60"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                Config
              </button>
              <button
                type="button"
                onClick={() => openPicker('.zip')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-slate-700/60"
              >
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                Pack (.zip)
              </button>
            </div>
          </div>

          <form onSubmit={handleUploadAndRegister} className="space-y-4">
            {/* Zona de Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => openPicker()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-slate-950/60'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70'
              }`}
            >
              {selectedFile ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
                      {getFileIcon(selectedFile.name, assetType)}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block truncate max-w-xs sm:max-w-md">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {formatBytes(selectedFile.size)} • Listo para sincronizar
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Quitar archivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Arrastra y suelta tu archivo aquí o <span className="text-emerald-400 underline">haz clic para explorar</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Soporta .jar (mods), .toml/.json/.properties (configs), .zip (shaders/texturas) hasta 100 MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Configurador visual de destino en Minecraft */}
            {selectedFile && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-emerald-400" />
                    Carpeta de Destino en el Cliente Minecraft
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Se creará automáticamente en la raíz del cliente
                  </span>
                </div>

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDestFolder('mods');
                      setAssetType('MOD');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      destFolder === 'mods'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    📁 mods/
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDestFolder('config');
                      setAssetType('CONFIG');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      destFolder === 'config'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    📁 config/
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDestFolder('shaderpacks');
                      setAssetType('SHADER');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      destFolder === 'shaderpacks'
                        ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    📁 shaderpacks/
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDestFolder('resourcepacks');
                      setAssetType('RESOURCEPACK');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      destFolder === 'resourcepacks'
                        ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    📁 resourcepacks/
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDestFolder('custom');
                      setAssetType('CUSTOM');
                      if (!customPath) setCustomPath(selectedFile.name);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      destFolder === 'custom'
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    ✏️ Ruta manual avanzada
                  </button>
                </div>

                {/* Si es ruta custom manual */}
                {destFolder === 'custom' && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                      placeholder="ej: kubejs/startup_scripts/init.js o defaultconfigs/rules.toml"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                )}

                {/* Breadcrumb visual de la ruta final en Minecraft */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="text-slate-500">.minecraft/</span>
                  <span className="text-emerald-400 font-bold">{finalTargetPath}</span>
                </div>
              </div>
            )}

            {/* Mensajes de Alerta */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Botón de Envío */}
            {selectedFile && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Calculando Hash SHA-1 y Subiendo a R2...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Subir y Sincronizar en R2</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Explorador de Archivos Sincronizados */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-4">
        {/* Barra superior de Filtros y Búsqueda */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          {/* Pills de Categoría */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded-md text-slate-400 font-mono">
                {assets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('MOD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'MOD'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mods (.jar)</span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded-md text-slate-400 font-mono">
                {modsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('CONFIG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'CONFIG'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Configs</span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded-md text-slate-400 font-mono">
                {configsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('SHADERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'SHADERS'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>Shaders & Packs</span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded-md text-slate-400 font-mono">
                {shadersCount}
              </span>
            </button>
          </div>

          {/* Buscador */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar archivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Lista de Archivos */}
        {filteredAssets.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-500">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">
                {searchQuery
                  ? 'No se encontraron archivos que coincidan con la búsqueda.'
                  : 'No hay archivos sincronizados en esta categoría.'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isFree
                  ? 'Pasa a PRO para sincronizar tus archivos y mods propios en Cloudflare R2.'
                  : 'Arrastra un archivo en la sección superior para añadirlo a la distribución.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map((asset) => {
              const pathParts = asset.fileName.split('/');
              const folderPart = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') + '/' : '';
              const filePart = pathParts[pathParts.length - 1];

              return (
                <div
                  key={asset.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl text-xs transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
                      {getFileIcon(asset.fileName, asset.assetType)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {folderPart && (
                          <span className="text-slate-500 font-mono text-[11px]">{folderPart}</span>
                        )}
                        <span className="font-bold text-white truncate max-w-xs sm:max-w-sm">{filePart}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">
                          {asset.assetType}
                        </span>

                        <span className="text-slate-500 font-mono">
                          {formatBytes(asset.fileSize)}
                        </span>

                        {asset.sha1 && (
                          <button
                            type="button"
                            onClick={() => copySha(asset.sha1!, asset.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-emerald-400 font-mono transition"
                            title="Copiar Hash SHA-1 de verificación"
                          >
                            {copiedId === asset.id ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-emerald-400">¡SHA Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>sha1:{asset.sha1.substring(0, 7)}...</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Sincronizado
                    </span>

                    {asset.downloadUrl && (
                      <a
                        href={asset.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={filePart}
                        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                        title="Descargar archivo para comprobar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      disabled={deletingId === asset.id}
                      onClick={() => {
                        if (confirm(`¿Eliminar "${asset.fileName}" de la sincronización del launcher?`)) {
                          handleDeleteAsset(asset.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-50"
                      title="Eliminar de la sincronización"
                    >
                      {deletingId === asset.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
