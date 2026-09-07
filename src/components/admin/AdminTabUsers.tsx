'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Shield,
  User as UserIcon,
  Crown,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';

interface UsersProps {
  users: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function AdminTabUsers({ users, loading, onRefresh }: UsersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [expandedUserIds, setExpandedUserIds] = useState<Record<string, boolean>>({});
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function toggleExpand(id: string) {
    setExpandedUserIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleUpdateField(userId: string, field: 'plan' | 'status' | 'role', value: string) {
    setUpdatingUserId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, [field]: value }),
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      } else {
        alert(data.error || 'Error al actualizar usuario');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUserToDelete(null);
        onRefresh();
      } else {
        alert(data.error || 'Error al eliminar usuario');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  // Filtrado local en tiempo real
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      searchQuery === '' ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlan = filterPlan === '' || u.plan === filterPlan;
    const matchesStatus = filterStatus === '' || u.status === filterStatus;
    const matchesRole = filterRole === '' || u.role === filterRole;

    return matchesQuery && matchesPlan && matchesStatus && matchesRole;
  });

  function exportToCsv() {
    const headers = ['ID', 'Email', 'Nombre', 'Rol', 'Plan', 'Estado', 'Total Launchers', 'Fecha Alta'];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.email,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      u.role,
      u.plan,
      u.status,
      u.launchers.length,
      new Date(u.createdAt).toISOString(),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `elysiumpad-clientes-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900/50 border border-slate-800/90 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por email o nombre..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Plan filter */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todos los Planes</option>
            <option value="FREE">Plan FREE</option>
            <option value="PRO">Plan PRO</option>
            <option value="LIFETIME">Plan LIFETIME</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todos los Estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="SUSPENDED">Suspendidos</option>
          </select>

          {/* Role filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todos los Roles</option>
            <option value="USER">Rol USER</option>
            <option value="ADMIN">Rol ADMIN</option>
          </select>

          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-300 hover:text-white transition"
            title="Exportar usuarios filtrados a CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
            {filteredUsers.length} resultado{filteredUsers.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Users CRM Table */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol & Permisos</th>
                <th className="px-6 py-4">Plan Actual</th>
                <th className="px-6 py-4">Launchers</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha Alta</th>
                <th className="px-6 py-4 text-right">Acciones Directas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {filteredUsers.map((u) => {
                const isUpdating = updatingUserId === u.id;
                const isExpanded = !!expandedUserIds[u.id];

                return (
                  <React.Fragment key={u.id}>
                    <tr className={`hover:bg-slate-800/30 transition ${isExpanded ? 'bg-slate-800/20' : ''}`}>
                      {/* Avatar & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400 shadow-sm">
                            {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white flex items-center gap-1.5">
                              {u.name || 'Sin nombre'}
                              {u.plan === 'LIFETIME' && (
                                <Crown className="w-3.5 h-3.5 text-amber-400 inline" />
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-6 py-4">
                        <select
                          disabled={isUpdating}
                          value={u.role}
                          onChange={(e) => handleUpdateField(u.id, 'role', e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-slate-950 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN 🛡️</option>
                        </select>
                      </td>

                      {/* Plan */}
                      <td className="px-6 py-4">
                        <select
                          disabled={isUpdating}
                          value={u.plan}
                          onChange={(e) => handleUpdateField(u.id, 'plan', e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                            u.plan === 'LIFETIME'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : u.plan === 'PRO'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-950 text-slate-400 border-slate-700'
                          }`}
                        >
                          <option value="FREE">Plan FREE</option>
                          <option value="PRO">Plan PRO ($4.99)</option>
                          <option value="LIFETIME">Plan LIFETIME ($49)</option>
                        </select>
                      </td>

                      {/* Launchers count & expander */}
                      <td className="px-6 py-4">
                        {u.launchers.length > 0 ? (
                          <button
                            onClick={() => toggleExpand(u.id)}
                            className="flex items-center gap-1.5 text-xs text-white hover:text-emerald-400 transition bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                          >
                            <Layers className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{u.launchers.length} servidor{u.launchers.length === 1 ? '' : 'es'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">0 creados</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4">
                        <button
                          disabled={isUpdating}
                          onClick={() =>
                            handleUpdateField(
                              u.id,
                              'status',
                              u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition hover:opacity-80 ${
                            u.status === 'ACTIVE'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          <span>{u.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}</span>
                        </button>
                      </td>

                      {/* Fecha de registro */}
                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setUserToDelete(u)}
                          title="Eliminar usuario"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Sub-fila expandida con launchers del usuario */}
                    {isExpanded && (
                      <tr className="bg-slate-950/70">
                        <td colSpan={7} className="px-8 py-4 border-y border-slate-800/80">
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Launchers y servidores asociados a {u.email}:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {u.launchers.map((l: any) => (
                                <div
                                  key={l.id}
                                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-semibold text-white text-xs">{l.name}</p>
                                    <p className="text-[10px] text-slate-400">
                                      MC {l.mcVersion} • {l.loader} • {l._count.mods} mods
                                    </p>
                                  </div>
                                  <Link
                                    href={`/d/${l.slug}`}
                                    target="_blank"
                                    className="text-xs text-emerald-400 hover:text-emerald-300 p-1.5 hover:bg-emerald-500/10 rounded-lg transition"
                                    title="Ver landing pública"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No se encontraron usuarios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación para eliminar usuario */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¿Eliminar usuario permanentemente?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Estás a punto de eliminar la cuenta de <span className="text-white font-semibold">{userToDelete.email}</span>.
                Se borrarán todos sus launchers ({userToDelete.launchers.length}) y archivos asociados. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white rounded-xl transition disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
