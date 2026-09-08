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
  Activity,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';

interface LaunchersProps {
  launchers: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function AdminTabLaunchers({ launchers, loading, onRefresh }: LaunchersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loaderFilter, setLoaderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'INACTIVE' | 'WARNINGS'>('ALL');
  const [inspectLauncher, setInspectLauncher] = useState<any | null>(null);
  const [launcherToDelete, setLauncherToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Health Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [healthResults, setHealthResults] = useState<Record<string, any>>({});
  const [healthStats, setHealthStats] = useState<{
    total: number;
    healthy: number;
    inactive: number;
    withWarnings: number;
  } | null>(null);

  async function handleScanHealth() {
    setIsScanning(true);
    try {
      const res = await fetch('/api/admin/launchers/health');
      const data = await res.json();
      if (data.success) {
        const mapping: Record<string, any> = {};
        data.results.forEach((r: any) => {
          mapping[r.launcherId] = r;
        });
        setHealthResults(mapping);
        setHealthStats(data.stats);
      }
    } catch (err) {
      console.error('Error scanning launcher health:', err);
    } finally {
      setIsScanning(false);
    }
  }

  const filteredLaunchers = launchers.filter((l) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      l.name.toLowerCase().includes(query) ||
      l.slug.toLowerCase().includes(query) ||
      (l.serverIp && l.serverIp.toLowerCase().includes(query)) ||
      (l.user && l.user.email.toLowerCase().includes(query));

    const matchesLoader = loaderFilter === '' || l.loader === loaderFilter;

    // Filter by health/inactivity status if scanned
    const healthInfo = healthResults[l.id];
    let matchesStatus = true;
    if (statusFilter === 'HEALTHY') {
      matchesStatus = healthInfo ? healthInfo.health === 'HEALTHY' && !healthInfo.isInactive : true;
    } else if (statusFilter === 'INACTIVE') {
      matchesStatus = healthInfo ? healthInfo.isInactive : (l.downloadCount === 0 && l.syncCount === 0);
    } else if (statusFilter === 'WARNINGS') {
      matchesStatus = healthInfo ? (healthInfo.warnings && healthInfo.warnings.length > 0) : false;
    }

    return matchesQuery && matchesLoader && matchesStatus;
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
      {/* Ecosystem Health & Inactivity Scanner Bar */}
      <div className="bg-[#111622] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Auditoría de Salud & Inactividad
              {healthStats && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Escaneo activo
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Verifica enlaces caídos, configs huérfanas y detecta servidores abandonados sin descargas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleScanHealth}
            disabled={isScanning}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analizando servidores...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>{healthStats ? 'Re-escanear Ecosistema' : 'Escanear Salud del Ecosistema'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats summary if scanned */}
      {healthStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-3.5 rounded-xl border text-left transition ${
              statusFilter === 'ALL'
                ? 'bg-slate-800/80 border-slate-600'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-lg font-black text-white">{healthStats.total}</div>
            <div className="text-xs text-slate-400 font-medium">Total Launchers</div>
          </button>

          <button
            onClick={() => setStatusFilter('HEALTHY')}
            className={`p-3.5 rounded-xl border text-left transition ${
              statusFilter === 'HEALTHY'
                ? 'bg-emerald-950/40 border-emerald-500'
                : 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            <div className="text-lg font-black text-emerald-400">{healthStats.healthy}</div>
            <div className="text-xs text-slate-400 font-medium">100% Operativos</div>
          </button>

          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`p-3.5 rounded-xl border text-left transition ${
              statusFilter === 'INACTIVE'
                ? 'bg-amber-950/40 border-amber-500'
                : 'bg-slate-900/40 border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="text-lg font-black text-amber-400">{healthStats.inactive}</div>
            <div className="text-xs text-slate-400 font-medium">Inactivos / 0 Descargas</div>
          </button>

          <button
            onClick={() => setStatusFilter('WARNINGS')}
            className={`p-3.5 rounded-xl border text-left transition ${
              statusFilter === 'WARNINGS'
                ? 'bg-rose-950/40 border-rose-500'
                : 'bg-slate-900/40 border-slate-800 hover:border-rose-500/40'
            }`}
          >
            <div className="text-lg font-black text-rose-400">{healthStats.withWarnings}</div>
            <div className="text-xs text-slate-400 font-medium">Con Advertencias</div>
          </button>
        </div>
      )}

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
            <option className="bg-[#111622] text-slate-100" value="">Todos los Modloaders</option>
            <option className="bg-[#111622] text-slate-100" value="FABRIC">Fabric</option>
            <option className="bg-[#111622] text-slate-100" value="FORGE">Forge</option>
            <option className="bg-[#111622] text-slate-100" value="NEOFORGE">NeoForge</option>
            <option className="bg-[#111622] text-slate-100" value="QUILT">Quilt</option>
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[11px] text-slate-400 font-mono">/d/{l.slug}</p>
                          {healthResults[l.id] && (
                            healthResults[l.id].isInactive ? (
                              <span
                                title={healthResults[l.id].inactivityReason}
                                className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 cursor-help"
                              >
                                Inactivo
                              </span>
                            ) : healthResults[l.id].health === 'HEALTHY' ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                ✓ Operativo
                              </span>
                            ) : (
                              <span
                                title={healthResults[l.id].warnings?.join('\n')}
                                className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 cursor-help"
                              >
                                ⚠️ Alerta
                              </span>
                            )
                          )}
                        </div>
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
                    {(() => {
                      const modCount = l._count?.mods ?? l.mods?.length ?? 0;
                      const assetCount = l._count?.customAssets ?? l.customAssets?.length ?? 0;
                      return (
                        <button
                          onClick={() => setInspectLauncher(l)}
                          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 transition bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5 text-purple-400" />
                          <span>{modCount} mods</span>
                          {assetCount > 0 && (
                            <span className="text-[10px] text-amber-400 font-mono">
                              +{assetCount} jars
                            </span>
                          )}
                        </button>
                      );
                    })()}
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
                  MC {inspectLauncher.mcVersion} • {inspectLauncher.loader} • {inspectLauncher.mods?.length || 0} mods instalados
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
              {inspectLauncher.mods && inspectLauncher.mods.length > 0 ? (
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
