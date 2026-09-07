import React, { useState } from 'react';
import {
  Save,
  Trash2,
  Loader2,
  Check,
  Crown,
  Lock,
  Sparkles,
  Sliders,
  Server,
  Cpu,
  ShieldCheck,
  Palette,
  Globe,
  AlertTriangle,
} from 'lucide-react';

interface TabOptionsProps {
  launcher: any;
  userPlan?: string;
  onUpdated: (newSlug?: string) => void;
  onDeleted: () => void;
  onUpgradeOpen?: () => void;
}

const COLOR_PRESETS = [
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Diamante', hex: '#06b6d4' },
  { name: 'Amatista', hex: '#a855f7' },
  { name: 'Redstone', hex: '#ef4444' },
  { name: 'Netherita', hex: '#64748b' },
  { name: 'Oro', hex: '#f59e0b' },
];

const RAM_PRESETS = [
  { label: '4 GB (Ligero)', val: 4 },
  { label: '6 GB (Recomendado)', val: 6 },
  { label: '8 GB (Modpacks)', val: 8 },
  { label: '12 GB (Pesado)', val: 12 },
];

export function TabOptions({
  launcher,
  userPlan,
  onUpdated,
  onDeleted,
  onUpgradeOpen,
}: TabOptionsProps) {
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
    if (!confirm(`¿Estás seguro de eliminar el servidor "${launcher.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await fetch(`/api/launchers/${launcher.slug}`, { method: 'DELETE' });
      onDeleted();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Configuración General del Launcher</h3>
            <p className="text-xs text-slate-400">
              Personaliza el nombre, slug público, conexión IP al servidor, memoria RAM recomendada y paleta de color.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjeta 1: Identidad del Servidor */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-bold text-white">Identidad & Enlace de Descarga</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Nombre del Servidor / Modpack
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Elysium SMP Vanilla+"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Nombre visible en el título del launcher y en la página de descarga.
            </p>
          </div>

          {/* Slug URL - Función PRO */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-300">
                Slug URL (Enlace Público)
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
                className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white focus:outline-none font-mono text-xs ${
                  !isPremium
                    ? 'border-slate-800 text-slate-400 cursor-not-allowed bg-slate-950/80 pr-10'
                    : 'border-slate-700/80 focus:border-indigo-500'
                }`}
              />
              {!isPremium && (
                <Lock className="w-4 h-4 text-amber-400/80 absolute right-3 top-2.5 pointer-events-none" />
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
                Enlace público de descarga: <span className="text-emerald-400 font-mono font-bold">/d/{slug}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Conexión al Servidor de Minecraft */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Server className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-white">Conexión al Servidor Minecraft</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-300 mb-1.5">
              IP o Dominio del Servidor
            </label>
            <input
              type="text"
              placeholder="play.miservidor.com o 185.22.45.10"
              value={serverIp}
              onChange={(e) => setServerIp(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              El launcher comprobará el estado (online/offline) y el ping de este servidor en tiempo real.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Puerto (Default: 25565)</label>
            <input
              type="number"
              value={serverPort}
              onChange={(e) => setServerPort(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Rendimiento & RAM Recomendada */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Memoria RAM Recomendada para Clientes</h4>
          </div>
          <span className="text-base font-black text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl">
            {ram} GB RAM
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Slider interactivo */}
          <div className="space-y-1">
            <input
              type="range"
              min={2}
              max={16}
              step={1}
              value={ram}
              onChange={(e) => setRam(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2 GB (Mínimo)</span>
              <span>8 GB</span>
              <span>16 GB (Máximo)</span>
            </div>
          </div>

          {/* Presets de RAM */}
          <div className="flex flex-wrap gap-2">
            {RAM_PRESETS.map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setRam(p.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  ram === p.val
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400">
            El launcher auto-configurará esta cantidad de RAM por defecto en el cliente de tus jugadores para evitar crasheos de memoria.
          </p>
        </div>
      </div>

      {/* Tarjeta 4: Acceso No-Premium (Offline) */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6">
        <label className="flex items-start justify-between gap-4 cursor-pointer">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Permitir Cuentas No-Premium (Modo Offline)</span>
            </div>
            <p className="text-xs text-slate-400">
              Permite que amigos que no tengan una cuenta oficial de Mojang/Microsoft puedan iniciar sesión y jugar sólo indicando su nick de Minecraft.
            </p>
          </div>

          <div className="relative inline-flex items-center flex-shrink-0">
            <input
              type="checkbox"
              checked={allowOffline}
              onChange={(e) => setAllowOffline(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </div>
        </label>
      </div>

      {/* Tarjeta 5: Color de Acento Visual */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Palette className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white">Personalización & Color de Acento</h4>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-xs text-slate-400">
            Selecciona el color temático principal para los botones, badges e interfaz del launcher compilado.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => setPrimaryColor(color.hex)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition ${
                  primaryColor.toLowerCase() === color.hex.toLowerCase()
                    ? 'border-white bg-slate-800 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="font-semibold">{color.name}</span>
              </button>
            ))}

            {/* Custom Color Input */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-slate-300 uppercase">{primaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Acciones / Guardar & Zona de Peligro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-500/10 transition"
        >
          <Trash2 className="w-4 h-4" /> Eliminar este Servidor
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando Opciones...</span>
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4" />
              <span>¡Cambios Guardados con Éxito!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
