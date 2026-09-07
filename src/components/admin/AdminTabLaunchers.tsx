'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Layers,
  ExternalLink,
  Trash2,
  Eye,
  Server,
  Download,
  Zap,
  Package,
  AlertTriangle,
  FileCode,
} from 'lucide-react';

interface LaunchersProps {
  launchers: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function AdminTabLaunchers({ launchers, loading, onRefresh }: LaunchersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loaderFilter, setLoaderFilter] = useState('');
  const [inspectLauncher, setInspectLauncher] = useState<any | null>(null);
  const [launcherToDelete, setLauncherToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredLaunchers = launchers.filter((l) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      l.name.toLowerCase().includes(query) ||
      l.slug.toLowerCase().includes(query) ||
      (l.serverIp && l.serverIp.toLowerCase().includes(query)) ||
      (l.user && l.user.email.toLowerCase().includes(query));

    const matchesLoader = loaderFilter === '' || l.loader === loaderFilter;

    return matchesQuery && matchesLoader;
  });

  async function handleDeleteLauncher() {
    if (!launcherToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/launchers?id=${launcherToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setLauncherToDelete(null);
        onRefresh();
      } else {
        alert(data.error || 'Error al eliminar launcher');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-slate-900/50 border border-slate-800/90 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, slug, IP del servidor o email del dueño..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={loaderFilter}
            onChange={(e) => setLoaderFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todos los Modloaders</option>
            <option value="FABRIC">Fabric</option>
            <option value="FORGE">Forge</option>
            <option value="NEOFORGE">NeoForge</option>
            <option value="QUILT">Quilt</option>
          </select>

          <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
            {filteredLaunchers.length} launcher{filteredLaunchers.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Launchers Table */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Launcher & Slug</th>
                <th className="px-6 py-4">Propietario</th>
                <th className="px-6 py-4">Motor / Versión</th>
                <th className="px-6 py-4">Servidor IP:Puerto</th>
                <th className="px-6 py-4">Contenido</th>
                <th className="px-6 py-4">Actividad</th>
                <th className="px-6 py-4 text-right">Moderación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {filteredLaunchers.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/30 transition">
                  {/* Launcher Name & Slug */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: l.primaryColor || '#10b981' }}
                      >
                        {l.name[0]?.toUpperCase() || 'L'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{l.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">/d/{l.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="px-6 py-4">
                    {l.user ? (
                      <div>
                        <p className="font-medium text-white">{l.user.name || 'Sin nombre'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{l.user.email}</p>
                        <span
                          className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            l.user.plan === 'LIFETIME'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : l.user.plan === 'PRO'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {l.user.plan}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Desconocido</span>
                    )}
                  </td>

                  {/* Engine */}
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {l.loader}
                      </span>
                      <p className="text-[11px] text-slate-400 font-mono">MC {l.mcVersion}</p>
                    </div>
                  </td>

                  {/* Server IP */}
                  <td className="px-6 py-4">
                    {l.serverIp ? (
                      <div className="flex items-center gap-1.5 font-mono text-slate-300">
                        <Server className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>
                          {l.serverIp}:{l.serverPort}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">No configurada</span>
                    )}
                  </td>

                  {/* Content (Mods & Custom Assets) */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setInspectLauncher(l)}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 transition bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                    >
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      <span>{l._count.mods} mods</span>
                      {l._count.customAssets > 0 && (
                        <span className="text-[10px] text-amber-400 font-mono">
                          +{l._count.customAssets} jars
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Activity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1" title="Descargas">
                        <Download className="w-3 h-3 text-slate-500" />
                        <span className="font-mono text-[11px]">{l.downloadCount}</span>
                      </span>
                      <span className="flex items-center gap-1" title="Sincronizaciones">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span className="font-mono text-[11px]">{l.syncCount}</span>
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/d/${l.slug}`}
                        target="_blank"
                        title="Ver página de descarga pública"
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setInspectLauncher(l)}
                        title="Inspeccionar mods"
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setLauncherToDelete(l)}
                        title="Eliminar por moderación"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLaunchers.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No se encontraron launchers con los criterios seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Inspeccionar Mods de un Launcher */}
      {inspectLauncher && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  Mods de {inspectLauncher.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  MC {inspectLauncher.mcVersion} • {inspectLauncher.loader} • {inspectLauncher.mods.length} mods instalados
                </p>
              </div>
              <button
                onClick={() => setInspectLauncher(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {inspectLauncher.mods.length > 0 ? (
                inspectLauncher.mods.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{m.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{m.fileName}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        m.isRequired
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.isRequired ? 'Obligatorio' : 'Opcional'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-xs text-slate-500">
                  Este launcher no tiene ningún mod sincronizado aún.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectLauncher(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmación Eliminar Launcher */}
      {launcherToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¿Eliminar launcher por moderación?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Estás a punto de eliminar el launcher{' '}
                <span className="text-white font-semibold">{launcherToDelete.name}</span> (/d/{launcherToDelete.slug}).
                Se borrarán sus listas de mods y accesos públicos.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setLauncherToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteLauncher}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white rounded-xl transition disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar launcher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
