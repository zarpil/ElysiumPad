'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileCode, Trash2, CheckCircle2, AlertCircle, Loader2, Sparkles, HardDrive } from 'lucide-react';

interface CustomAssetsManagerProps {
  launcherSlug: string;
  isFree: boolean;
  assets: any[];
  onAssetChanged: () => void;
}

export function CustomAssetsManager({
  launcherSlug,
  isFree,
  assets,
  onAssetChanged,
}: CustomAssetsManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetPath, setTargetPath] = useState('');
  const [assetType, setAssetType] = useState('MOD');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);

    // Auto-completar ruta sugerida
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'jar') {
      setAssetType('MOD');
      setTargetPath(`mods/${file.name}`);
    } else if (ext === 'properties' || ext === 'json' || ext === 'toml' || ext === 'ini' || ext === 'txt') {
      setAssetType('CONFIG');
      setTargetPath(`config/${file.name}`);
    } else if (ext === 'zip') {
      setAssetType('SHADER');
      setTargetPath(`shaderpacks/${file.name}`);
    } else {
      setTargetPath(file.name);
    }
  };

  async function handleUploadAndRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor selecciona un archivo para subir');
      return;
    }

    if (isFree) {
      setError('Sube a PRO para sincronizar mods y archivos propios.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Subir archivo a través de /api/upload (Cloudflare R2 o Local con hash SHA)
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

      // 2. Registrar en la base de datos vinculado al launcher
      const assetRes = await fetch(`/api/launchers/${launcherSlug}/custom-assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: targetPath.trim() || selectedFile.name,
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

      setSelectedFile(null);
      setTargetPath('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccessMsg(`¡${selectedFile.name} subido y sincronizado con éxito!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      onAssetChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteAsset(assetId: string) {
    if (!confirm('¿Eliminar este archivo de la sincronización?')) return;
    try {
      await fetch(`/api/launchers/${launcherSlug}/custom-assets?assetId=${assetId}`, {
        method: 'DELETE',
      });
      onAssetChanged();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-[#141b29] border border-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            Mods Propios y Configs (Cloudflare R2 / CDN)
            {isFree && (
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase font-bold">
                Exclusivo PRO
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sube mods privados (.jar) y archivos de configuración para sincronizarlos en los clientes con caché inmutable.
          </p>
        </div>
      </div>

      {isFree ? (
        <div className="p-6 bg-slate-950/60 border border-amber-500/20 rounded-xl text-center space-y-3">
          <p className="text-sm text-slate-300">
            La subida de archivos y mods propios a Cloudflare R2 está reservada para cuentas PRO y LIFETIME.
          </p>
          <span className="inline-block text-xs bg-amber-500/20 text-amber-400 font-semibold px-3 py-1.5 rounded-lg">
            Sincroniza tus propios mods .jar, shaders y configs
          </span>
        </div>
      ) : (
        <form onSubmit={handleUploadAndRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Seleccionar Archivo Local
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="w-full text-xs text-slate-400 file:mr-2.5 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer bg-slate-950 border border-slate-800 rounded-xl p-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Ruta Destino en Minecraft (ej: mods/privado.jar)
              </label>
              <input
                type="text"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                placeholder="mods/tu-mod.jar o config/config.json"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Archivo</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="MOD">Mod Personalizado (.jar)</option>
                <option value="CONFIG">Configuración (config/)</option>
                <option value="SHADER">Shaderpack (.zip)</option>
                <option value="RESOURCEPACK">Resourcepack (.zip)</option>
              </select>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Archivo: <strong className="text-white">{selectedFile.name}</strong> ({Math.round(selectedFile.size / 1024)} KB)</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Calculando SHA y Subiendo a Cloudflare R2...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Subir y Sincronizar Archivo</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Lista de Custom Assets */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Archivos Sincronizados ({assets.length})
        </h4>

        {assets.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 italic">
            No hay archivos personalizados sincronizados todavía.
          </p>
        ) : (
          <div className="space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-slate-200">{asset.fileName}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {asset.assetType}
                  </span>
                  {asset.fileSize > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {Math.round(asset.fileSize / 1024)} KB
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-500/10 transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
