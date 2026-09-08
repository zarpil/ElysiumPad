'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Layers,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  ExternalLink,
  Terminal,
  RefreshCw,
  Loader2,
  HardDrive,
  Cpu,
} from 'lucide-react';

interface UpdateFile {
  name: string;
  sizeBytes: number;
  updatedAt: string;
  url: string;
}

interface UpdateChannelInfo {
  hasRelease: boolean;
  currentLatestVersion: string;
  releaseDate?: string | null;
  targetExe?: string | null;
  sha512?: string | null;
  hasExe: boolean;
  files: UpdateFile[];
  feedUrl: string;
}

export function AdminTabUpdates() {
  const [channelInfo, setChannelInfo] = useState<UpdateChannelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function fetchChannelInfo() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/launcher/updates');
      const data = await res.json();
      if (data.success) {
        setChannelInfo(data);
      } else {
        setErrorMessage(data.error || 'Error al cargar el canal de actualizaciones');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChannelInfo();
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadMessage(null);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/launcher/updates', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Error al subir ${file.name}`);
        }
      }

      setUploadMessage(`Archivos subidos con éxito (${files.length} archivo/s procesados)`);
      await fetchChannelInfo();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al subir los archivos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDeleteFile(fileName: string) {
    if (!confirm(`¿Eliminar el archivo "${fileName}" del servidor?`)) return;

    try {
      const res = await fetch(`/api/launcher/updates?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchChannelInfo();
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Canal de Versiones y Auto-Actualización (.EXE)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Administra los instaladores oficiales y los parches de actualización del software del launcher para Windows.
            </p>
          </div>
        </div>

        <button
          onClick={fetchChannelInfo}
          disabled={loading}
          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-medium transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-medium">Versión Publicada</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-white font-mono">
              v{channelInfo?.currentLatestVersion || '1.0.0'}
            </span>
            {channelInfo?.hasRelease ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 font-medium">
                Activo
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/60 font-medium">
                Sin release
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 pt-1">
            {channelInfo?.hasRelease ? 'Los launchers descargan parches desde este feed.' : 'Sube latest.yml para activar el canal.'}
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-medium">Instalador Base (.exe)</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-white">
              {channelInfo?.hasExe ? 'Disponible' : 'Pendiente'}
            </span>
            {channelInfo?.hasExe ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <p className="text-[11px] text-zinc-500 pt-1">
            {channelInfo?.hasExe ? 'Listo para descargas públicas en /d/[slug].' : 'Sube el instalador ejecutable.'}
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-1">
          <span className="text-[11px] text-zinc-400 uppercase font-medium">Archivos en el Servidor</span>
          <p className="text-2xl font-bold text-white mt-1">
            {channelInfo?.files?.length || 0}
          </p>
          <p className="text-[11px] text-zinc-500 pt-1 font-mono truncate">
            Feed: {channelInfo?.feedUrl || '/api/launcher/updates'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {uploadMessage && (
        <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{uploadMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-zinc-900 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Subir Nueva Versión o Parche del Launcher
          </h4>
          <p className="text-xs text-zinc-400 mt-1">
            Arrastra o selecciona los archivos generados por <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">npm run dist</code> en la carpeta <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">launcher/dist-release/</code> (<code className="text-zinc-300 font-mono">latest.yml</code>, el instalador <code className="text-zinc-300 font-mono">.exe</code> y el <code className="text-zinc-300 font-mono">.blockmap</code>).
          </p>
        </div>

        <div className="border border-dashed border-zinc-700 rounded-xl p-8 text-center bg-zinc-950/40 hover:border-zinc-600 transition">
          <input
            type="file"
            id="launcher-update-upload"
            multiple
            accept=".yml,.yaml,.exe,.blockmap,.zip,.json"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />

          <label
            htmlFor="launcher-update-upload"
            className="cursor-pointer flex flex-col items-center justify-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                {uploading ? 'Subiendo y guardando archivos...' : 'Haz clic para seleccionar archivos o arrástralos aquí'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Formatos admitidos: .yml, .exe, .blockmap, .zip
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Archivos del Canal de Distribución ({channelInfo?.files?.length || 0})
          </h4>
          <span className="text-[11px] text-zinc-500 font-mono">/public/updates/</span>
        </div>

        {channelInfo?.files && channelInfo.files.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Nombre de Archivo</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Tamaño</th>
                  <th className="px-6 py-3">Fecha de Modificación</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {channelInfo.files.map((file) => {
                  const isYml = file.name.endsWith('.yml') || file.name.endsWith('.yaml');
                  const isExe = file.name.endsWith('.exe');
                  const isBlockmap = file.name.endsWith('.blockmap');

                  return (
                    <tr key={file.name} className="hover:bg-zinc-800/30 transition">
                      <td className="px-6 py-3 font-mono font-medium text-white flex items-center gap-2">
                        {isExe && <HardDrive className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                        {isYml && <FileCode className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                        {isBlockmap && <Layers className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                        <span className="truncate max-w-xs">{file.name}</span>
                      </td>

                      <td className="px-6 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {isYml ? 'Manifiesto YML' : isExe ? 'Ejecutable .EXE' : isBlockmap ? 'Blockmap Parche' : 'Archivo'}
                        </span>
                      </td>

                      <td className="px-6 py-3 font-mono text-zinc-400">
                        {formatBytes(file.sizeBytes)}
                      </td>

                      <td className="px-6 py-3 text-zinc-400">
                        {new Date(file.updatedAt).toLocaleString()}
                      </td>

                      <td className="px-6 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={file.url}
                            download={file.name}
                            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                            title="Descargar archivo"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleDeleteFile(file.name)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                            title="Eliminar archivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <Cpu className="w-7 h-7 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">No hay archivos en el canal de actualizaciones todavía.</p>
            <p className="text-[11px] text-zinc-500">
              Sube el archivo <code className="font-mono text-zinc-400">latest.yml</code> y el instalador <code className="font-mono text-zinc-400">.exe</code> usando el cuadro superior.
            </p>
          </div>
        )}
      </div>

      {/* Guide Card */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-3">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400" />
          Guía de Compilación y Publicación de Versiones
        </h4>

        <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
          <p>
            Para publicar una versión nueva (ejemplo: de <code className="text-zinc-300 font-mono">1.0.0</code> a <code className="text-zinc-300 font-mono">1.0.1</code>):
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 pl-1">
            <li>
              En el archivo <code className="text-zinc-200 font-mono">launcher/package.json</code>, cambia el campo <code className="text-zinc-200 font-mono">"version": "1.0.1"</code>.
            </li>
            <li>
              En la terminal de tu equipo, compila el ejecutable con:
              <div className="mt-1 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-[11px] text-emerald-400">
                npm --prefix launcher run dist:nsis
              </div>
            </li>
            <li>
              Abre la carpeta resultante <code className="text-zinc-200 font-mono">launcher/dist-release/</code> y sube a este panel los 3 archivos generados:
              <ul className="list-disc list-inside pl-4 pt-1 text-[11px] text-zinc-400">
                <li><code className="text-zinc-300 font-mono">latest.yml</code> (información de versión y hash SHA-512)</li>
                <li><code className="text-zinc-300 font-mono">ElysiumPad Launcher-1.0.1-nsis.exe</code> (instalador)</li>
                <li><code className="text-zinc-300 font-mono">ElysiumPad Launcher-1.0.1-nsis.exe.blockmap</code> (parche diferencial rápido)</li>
              </ul>
            </li>
            <li>
              Listo. Los jugadores que tengan el launcher abierto recibirán automáticamente la notificación de actualización en segundo plano sin reinstalar.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
