'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Percent,
  Plus,
  Trash2,
  Copy,
  Check,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  DollarSign,
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
}

export function AdminTabCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState<number>(25);
  const [newMaxUses, setNewMaxUses] = useState<number>(100);
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function handleToggleActive(coupon: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (err) {
      console.error('Error toggling coupon:', err);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente el cupón "${code}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discountPercent: newDiscount,
          maxUses: newMaxUses,
          expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
          description: newDescription.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => [data.coupon, ...prev]);
        setShowModal(false);
        setNewCode('');
        setNewDiscount(25);
        setNewMaxUses(100);
        setNewExpiresAt('');
        setNewDescription('');
      } else {
        setFormError(data.error || 'Error al crear cupón');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

    if (filterActive === 'ACTIVE') return matchesSearch && c.isActive;
    if (filterActive === 'INACTIVE') return matchesSearch && !c.isActive;
    return matchesSearch;
  });

  // Estadísticas rápidas
  const totalUses = coupons.reduce((acc, c) => acc + c.usedCount, 0);
  const activeCouponsCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111622] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{coupons.length}</div>
            <div className="text-xs text-slate-400 font-medium">Cupones Creados ({activeCouponsCount} activos)</div>
          </div>
        </div>

        <div className="bg-[#111622] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalUses}</div>
            <div className="text-xs text-slate-400 font-medium">Canjes Totales Registrados</div>
          </div>
        </div>

        <div className="bg-[#111622] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Gestión de Promociones</div>
            <div className="text-xs text-slate-400 mt-0.5">Crea códigos con % de descuento para campañas o streamers.</div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Crear Cupón
          </button>
        </div>
      </div>

      {/* Control bar: Search + Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111622] p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterActive('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterActive === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({coupons.length})
            </button>
            <button
              onClick={() => setFilterActive('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterActive === 'ACTIVE' ? 'bg-emerald-600/30 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterActive('INACTIVE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterActive === 'INACTIVE' ? 'bg-rose-600/30 text-rose-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Inactivos
            </button>
          </div>

          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Coupons List / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#111622] rounded-2xl border border-slate-800 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-xs">Cargando códigos promocionales...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-16 bg-[#111622] rounded-2xl border border-slate-800">
          <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No se encontraron cupones</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search ? 'Ningún cupón coincide con tu búsqueda actual.' : 'Aún no has creado ningún código de descuento. ¡Crea el primero!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => {
            const isExpired = coupon.expiresAt && new Date() > new Date(coupon.expiresAt);
            const isDepleted = coupon.usedCount >= coupon.maxUses;

            return (
              <div
                key={coupon.id}
                className={`bg-[#111622] rounded-2xl border p-5 relative overflow-hidden transition ${
                  !coupon.isActive || isExpired || isDepleted
                    ? 'border-slate-800/60 opacity-80'
                    : 'border-slate-800 hover:border-emerald-500/40 shadow-lg shadow-black/20'
                }`}
              >
                {/* Header: Code + Percent Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-white bg-slate-900 px-3 py-1 rounded-xl border border-slate-700/80 tracking-wider">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                      title="Copiar código"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span className="text-sm font-black px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    -{coupon.discountPercent}%
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 min-h-[32px] line-clamp-2 mb-4">
                  {coupon.description || 'Sin notas descriptivas para este código.'}
                </p>

                {/* Progress bar of usages */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Usos</span>
                    <span>
                      <strong className="text-white">{coupon.usedCount}</strong> / {coupon.maxUses}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDepleted ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Status Badges & Expiration */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {coupon.expiresAt
                        ? `Caduca: ${new Date(coupon.expiresAt).toLocaleDateString()}`
                        : 'Sin vencimiento'}
                    </span>
                  </div>

                  {isExpired ? (
                    <span className="text-rose-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Caducado
                    </span>
                  ) : isDepleted ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Agotado
                    </span>
                  ) : coupon.isActive ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Activo
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Pausado
                    </span>
                  )}
                </div>

                {/* Actions bottom */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      coupon.isActive
                        ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    }`}
                  >
                    {coupon.isActive ? 'Pausar' : 'Activar'}
                  </button>

                  <button
                    onClick={() => handleDelete(coupon.id, coupon.code)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Eliminar cupón"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear Cupón */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111622] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Crear Nuevo Cupón</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código Promocional
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="EJ: MINECRAFT50, ELYSIUM2026"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm text-white uppercase tracking-wider placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
                      setNewCode(`ELY-${rand}`);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md hover:bg-emerald-500/20 transition"
                  >
                    Generar Azar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descuento (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(Number(e.target.value))}
                      className="w-full pl-3 pr-7 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-emerald-500 transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Límite de Canjes
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fecha de Caducidad (Opcional)
                </label>
                <input
                  type="date"
                  value={newExpiresAt}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción o Campaña
                </label>
                <input
                  type="text"
                  placeholder="Ej: Patrocinio con Creador de Contenido X"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Guardar Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
