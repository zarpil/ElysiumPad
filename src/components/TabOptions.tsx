import React, { useState } from 'react';
import { Save, Trash2, Loader2, Check, Crown, Lock, Sparkles } from 'lucide-react';

interface TabOptionsProps {
  launcher: any;
  userPlan?: string;
  onUpdated: (newSlug?: string) => void;
  onDeleted: () => void;
  onUpgradeOpen?: () => void;
}

export function TabOptions({ launcher, userPlan, onUpdated, onDeleted, onUpgradeOpen }: TabOptionsProps) {
  const isPremium = userPlan === 'PRO' || userPlan === 'LIFETIME' || userPlan === 'ADMIN';
  const [name, setName] = useState(launcher.name);
  const [slug, setSlug] = useState(launcher.slug || '');
  const [serverIp, setServerIp] = useState(launcher.serverIp || '');
  const [serverPort, setServerPort] = useState(launcher.serverPort || 25565);
  const [allowOffline, setAllowOffline] = useState(launcher.allowOffline ?? true);
  const [ram, setRam] = useState(launcher.recommendedRamGb || 4);
  const [primaryColor, setPrimaryColor] = useState(launcher.primaryColor || '#10b981');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch(`/api/launchers/${launcher.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: isPremium && slug ? slug.trim() : undefined,
          serverIp: serverIp.trim() || undefined,
          serverPort: Number(serverPort),
          allowOffline,
          recommendedRamGb: Number(ram),
          primaryColor,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al guardar opciones');
      }
      setSuccess(true);
      const updatedSlug = data.launcher?.slug || slug;
      onUpdated(updatedSlug);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar servidor ${launcher.name}?`)) return;
    try {
      await fetch(`/api/launchers/${launcher.slug}`, { method: 'DELETE' });
      onDeleted();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-white">Opciones del Servidor & Launcher</h3>
        <p className="text-xs text-slate-400 mt-0.5">Configuración de juego, RAM y tema del launcher.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">Nombre del Servidor</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Slug URL - Función PRO */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-semibold text-slate-300">
              Slug URL (Página de Descarga)
            </label>
            {!isPremium && (
              <button
                type="button"
                onClick={onUpgradeOpen}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                PRO Exclusivo
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              readOnly={!isPremium}
              value={slug}
              onChange={(e) => {
                if (isPremium) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white focus:outline-none font-mono ${
                !isPremium
                  ? 'border-slate-800 text-slate-400 cursor-not-allowed bg-slate-950/80 pr-10'
                  : 'border-slate-700/80 focus:border-emerald-500'
              }`}
            />
            {!isPremium && (
              <Lock className="w-4 h-4 text-amber-400/80 absolute right-3 top-3 pointer-events-none" />
            )}
          </div>
          {!isPremium ? (
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>URL aleatoria asignada.</span>
              {onUpgradeOpen && (
                <button
                  type="button"
                  onClick={onUpgradeOpen}
                  className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Personalizar con PRO
                </button>
              )}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Enlace público: <span className="text-emerald-400 font-mono">/d/{slug}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">RAM Asignada Recomendada (GB)</label>
          <input
            type="number"
            min={2}
            max={32}
            value={ram}
            onChange={(e) => setRam(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">IP del Servidor Minecraft</label>
          <input
            type="text"
            placeholder="mc.amigos.es"
            value={serverIp}
            onChange={(e) => setServerIp(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">Puerto del Servidor</label>
          <input
            type="number"
            value={serverPort}
            onChange={(e) => setServerPort(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-white">Permitir jugadores No-Premium (Offline)</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Los amigos sin cuenta de pago podrán jugar sólo con su nick.
          </p>
        </div>
        <input
          type="checkbox"
          checked={allowOffline}
          onChange={(e) => setAllowOffline(e.target.checked)}
          className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
        />
      </div>

      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-white">Color de Acento del Launcher</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Color temático de los botones.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
          />
          <span className="text-xs font-mono text-slate-300 uppercase">{primaryColor}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Eliminar este Servidor
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : success ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{success ? 'Guardado Correctamente' : 'Guardar Opciones'}</span>
        </button>
      </div>
    </form>
  );
}
