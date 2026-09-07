import React, { useState, useRef } from 'react';
import { Plus, Trash2, UploadCloud, Lock, Sparkles, AlertCircle, FileCode, Check, Loader2, FileUp, X } from 'lucide-react';

interface TabModsProps {
  mods: any[];
  customAssets: any[];
  launcherSlug: string;
  isFree: boolean;
  onOpenSearch: () => void;
  onDeleteMod: (id: string) => void;
  onDeleteCustomAsset: (id: string) => void;
  onAssetAdded: () => void;
  onUpgradeOpen?: () => void;
}

export function TabMods({
  mods,
  customAssets,
  launcherSlug,
  isFree,
  onOpenSearch,
  onDeleteMod,
  onDeleteCustomAsset,
  onAssetAdded,
  onUpgradeOpen,
}: TabModsProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customUploading, setCustomUploading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customMods = customAssets.filter((a) => a.assetType === 'MOD');

  function handleFileSelect(file: File) {
    if (!file.name.endsWith('.jar')) {
      setCustomError('El archivo debe tener extensión .jar');
      return;
    }
    setCustomError(null);
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  async function handleAddCustomMod(e: React.FormEvent) {
    e.preventDefault();
    if (isFree) return;
    if (!selectedFile) {
      setCustomError('Selecciona o arrastra un archivo .jar');
      return;
    }

    setCustomUploading(true);
    setCustomError(null);

    try {
      // 1. Subir archivo a /api/upload para calcular SHA y almacenar
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'mod');
      formData.append('slug', launcherSlug);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Error al subir el archivo');
      }

      // 2. Asociar el mod al launcher
      const res = await fetch(`/api/launchers/${launcherSlug}/custom-assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `mods/${selectedFile.name}`,
          assetType: 'MOD',
          fileSize: uploadData.fileSize,
          sha1: uploadData.sha1,
          contentType: selectedFile.type,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al asociar el mod al launcher');
      }

      setSelectedFile(null);
      setShowCustomModal(false);
      onAssetAdded();
    } catch (err: any) {
      setCustomError(err.message);
    } finally {
      setCustomUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner Superior */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Mods del Servidor</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sincroniza mods oficiales de Modrinth o arrastra tus propios archivos .jar
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón Custom Mod con Upsell */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold rounded-xl text-xs transition flex items-center gap-2 group shadow-sm"
          >
            {isFree ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
                <span>Mod Custom (.jar)</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-extrabold">
                  PRO
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-teal-400" />
                <span>Subir Mod (.jar)</span>
              </>
            )}
          </button>

          {/* Botón Modrinth */}
          <button
            onClick={onOpenSearch}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Buscar en Modrinth
          </button>
        </div>
      </div>

      {/* Mods Custom Subidos */}
      {customMods.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Mods Propios del Servidor
            </h4>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
              PRO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customMods.map((asset: any) => (
              <div
                key={asset.id}
                className="p-4 bg-[#111622] border border-amber-500/20 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-xs text-amber-400 flex-shrink-0">
                    JAR
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate font-mono">{asset.fileName}</p>
                    <p className="text-[10px] text-amber-400/80">
                      {(asset.fileSize / 1024).toFixed(0)} KB • Servidor
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteCustomAsset(asset.id)}
                  className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mods de Modrinth */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Mods de Modrinth ({mods.length})
        </h4>

        {mods.length === 0 ? (
          <div className="text-center py-16 bg-[#141a29]/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
            <p className="text-slate-400 text-sm">No has añadido ningún mod aún.</p>
            <button
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition"
            >
              <Plus className="w-4 h-4" /> Abrir Explorador de Mods
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mods.map((mod: any) => (
              <div
                key={mod.id}
                className="p-4 bg-[#141a29] border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {mod.modrinthId ? (
                    <a
                      href={`https://modrinth.com/mod/${mod.modrinthId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex-shrink-0"
                      title="Ver en Modrinth"
                    >
                      {mod.iconUrl ? (
                        <img
                          src={mod.iconUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-800 group-hover:border-emerald-500 group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:text-emerald-400 transition">
                          JAR
                        </div>
                      )}
                    </a>
                  ) : mod.iconUrl ? (
                    <img
                      src={mod.iconUrl}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 flex-shrink-0">
                      JAR
                    </div>
                  )}

                  <div className="min-w-0">
                    {mod.modrinthId ? (
                      <a
                        href={`https://modrinth.com/mod/${mod.modrinthId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-white truncate block hover:text-emerald-400 transition"
                        title="Ver en Modrinth"
                      >
                        {mod.title}
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-white truncate">{mod.title}</p>
                    )}
                    <p className="text-[11px] text-slate-400 truncate font-mono">{mod.fileName}</p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMod(mod.id)}
                  className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition"
                  title="Eliminar mod"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DRAG & DROP O UPSELL PRO */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141a29] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-teal-400" />
                Añadir Mod Personalizado (.jar)
              </h3>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setSelectedFile(null);
                  setCustomError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {isFree ? (
              /* TARJETA PERSUASIVA UPSELL A PRO */
              <div className="space-y-4 py-2">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Función Exclusiva PRO</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sube mods propios arrastrando tu archivo .jar para que todos tus jugadores lo descarguen automáticamente.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Arrastra y sube cualquier mod .jar privado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Launchers activos ilimitados (sin límite de 1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>100% White-label sin marcas de agua</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowCustomModal(false);
                    if (onUpgradeOpen) onUpgradeOpen();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
                >
                  Mejorar a Plan PRO — $4.99 / mes
                </button>
              </div>
            ) : (
              /* DRAG AND DROP PARA USUARIOS PRO/LIFETIME */
              <form onSubmit={handleAddCustomMod} className="space-y-4 text-xs">
                {/* Zona de Drop */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-teal-400 bg-teal-500/10'
                      : selectedFile
                      ? 'border-emerald-500/60 bg-emerald-500/5'
                      : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".jar"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                        <FileCode className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-white text-xs truncate max-w-[260px] mx-auto font-mono">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {(selectedFile.size / 1024).toFixed(0)} KB • Pulsa para cambiar archivo
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-teal-400 flex items-center justify-center mx-auto">
                        <FileUp className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-white text-xs">
                        Arrastra tu archivo <span className="text-teal-400 font-mono">.jar</span> aquí
                      </p>
                      <p className="text-[11px] text-slate-400">
                        o haz clic para explorar tus archivos
                      </p>
                    </div>
                  )}
                </div>

                {customError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{customError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomModal(false);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={customUploading || !selectedFile}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center gap-2"
                  >
                    {customUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                    <span>{customUploading ? 'Subiendo mod...' : 'Subir Mod'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
