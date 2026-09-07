'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Clock,
  User as UserIcon,
  Filter,
  CheckCircle,
  AlertOctagon,
  Settings,
  Layers,
  Trash2,
} from 'lucide-react';

export function AdminTabAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/audit?q=${encodeURIComponent(searchQuery)}&action=${actionFilter}`
      );
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  function getActionBadge(action: string) {
    if (action.includes('DELETED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Trash2 className="w-3 h-3" /> {action}
        </span>
      );
    }
    if (action.includes('SETTINGS')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          <Settings className="w-3 h-3" /> {action}
        </span>
      );
    }
    if (action.includes('LAUNCHER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <Layers className="w-3 h-3" /> {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle className="w-3 h-3" /> {action}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-slate-900/50 border border-slate-800/90 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            placeholder="Buscar en logs por detalle o email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option className="bg-[#111622] text-slate-100" value="">Todas las Acciones</option>
            <option className="bg-[#111622] text-slate-100" value="ADMIN_USER_UPDATED">ADMIN_USER_UPDATED</option>
            <option className="bg-[#111622] text-slate-100" value="ADMIN_USER_DELETED">ADMIN_USER_DELETED</option>
            <option className="bg-[#111622] text-slate-100" value="ADMIN_LAUNCHER_DELETED">ADMIN_LAUNCHER_DELETED</option>
            <option className="bg-[#111622] text-slate-100" value="GLOBAL_SETTINGS_UPDATED">GLOBAL_SETTINGS_UPDATED</option>
          </select>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
            title="Recargar logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4">Detalles del Evento</th>
                <th className="px-6 py-4">Usuario Asociado</th>
                <th className="px-6 py-4">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 whitespace-nowrap">{getActionBadge(log.action)}</td>

                  <td className="px-6 py-4">
                    <p className="text-white font-medium text-xs leading-relaxed">{log.details}</p>
                    {log.ipAddress && (
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">IP: {log.ipAddress}</p>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.user ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-emerald-400">
                          {log.user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs text-slate-300">{log.user.email}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{log.user.role}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Sistema / Admin</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500">
                    No hay registros de auditoría que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
