'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Radio,
  UserPlus,
  Layers,
  Megaphone,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';

interface SettingsProps {
  initialSettings: any;
  onRefresh: () => void;
}

export function AdminTabSettings({ initialSettings, onRefresh }: SettingsProps) {
  const [settings, setSettings] = useState<any>(initialSettings || {});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  async function handleSaveSettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        onRefresh();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || 'Error al guardar configuración');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
      {/* Save indicator / top bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Configuración del SaaS ElysiumPad</h3>
            <p className="text-xs text-slate-400">
              Controla directivas operativas, anuncios globales y límites comerciales.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <span>Guardando...</span>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-white" />
              <span>¡Guardado!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {/* Operación y Acceso */}
      <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-6">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" /> Operación de Plataforma y Seguridad
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Mantenimiento */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <Radio className={`w-3.5 h-3.5 ${settings.maintenanceMode ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                Modo Mantenimiento (Killswitch)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Bloquea el acceso al panel a usuarios estándar mientras realizas migraciones o soporte.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={!!settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Registros */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                Registros de Nuevos Usuarios
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Permitir que nuevos clientes se den de alta en /register. Desactívalo para modo invitación/beta privada.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={settings.registrationsOpen !== false}
                onChange={(e) => setSettings({ ...settings, registrationsOpen: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Límites de Plan Free */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="max-w-xs space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Límite de Launchers para Plan FREE
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={settings.freePlanMaxLaunchers ?? 1}
              onChange={(e) =>
                setSettings({ ...settings, freePlanMaxLaunchers: parseInt(e.target.value) || 1 })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[10px] text-slate-500">
              Número máximo de servidores que un usuario gratuito puede tener activos antes de requerir PRO.
            </p>
          </div>
        </div>
      </div>

      {/* Banner Global de Anuncio a Usuarios */}
      <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" /> Banner Global de Anuncios
          </h4>
          <span className="text-[11px] text-slate-400">Visible para todos los usuarios en su panel</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Texto del Mensaje (dejar en blanco para desactivar)
            </label>
            <input
              type="text"
              value={settings.bannerAnnouncement || ''}
              onChange={(e) => setSettings({ ...settings, bannerAnnouncement: e.target.value })}
              placeholder="Ej: 🔥 50% de descuento en Plan Lifetime por inauguración usando el código ELYSIUM50"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Estilo del Anuncio</label>
              <select
                value={settings.bannerType || 'INFO'}
                onChange={(e) => setSettings({ ...settings, bannerType: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="INFO">Información (Azul / Cyan)</option>
                <option value="WARNING">Advertencia (Ámbar / Amarillo)</option>
                <option value="CRITICAL">Urgente / Crítico (Rojo / Rose)</option>
                <option value="PROMO">Promoción / Éxito (Verde Esmeralda)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Acción Rápida</label>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, bannerAnnouncement: '' })}
                className="w-full px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Desactivar / Borrar Anuncio
              </button>
            </div>
          </div>

          {/* Vista previa en tiempo real del banner */}
          {settings.bannerAnnouncement && (
            <div className="pt-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Vista previa en vivo:
              </p>
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                  settings.bannerType === 'CRITICAL'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : settings.bannerType === 'WARNING'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : settings.bannerType === 'PROMO'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-4 h-4 flex-shrink-0" />
                  <span>{settings.bannerAnnouncement}</span>
                </div>
                <span className="text-[10px] opacity-70 border border-current px-2 py-0.5 rounded">
                  {settings.bannerType}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publicidad y Patrocinadores (Plan FREE - Estilo Aternos) */}
      <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Publicidad y Sponsors en Plan FREE (Estilo Aternos)
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Monetiza a los usuarios del plan gratuito en el panel web, páginas de descarga pública y en el launcher.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.adsEnabled !== false}
              onChange={(e) => setSettings({ ...settings, adsEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              URL de Destino del Sponsor / Afiliado
            </label>
            <input
              type="url"
              value={settings.adBannerLink || ''}
              onChange={(e) => setSettings({ ...settings, adBannerLink: e.target.value })}
              placeholder="https://apexminecrafthosting.com/?aff=tu_id"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
            <p className="text-[10px] text-slate-500">
              Enlace al que se redirige al hacer clic en el anuncio.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Texto del Banner / Subtítulo
            </label>
            <input
              type="text"
              value={settings.adBannerText || ''}
              onChange={(e) => setSettings({ ...settings, adBannerText: e.target.value })}
              placeholder="Alojamiento NVMe de alto rendimiento • Cupón ELYSIUM 20% OFF"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
            <p className="text-[10px] text-slate-500">
              Descripción de la oferta o sponsor mostrado en el banner.
            </p>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Imagen Gráfica del Banner (Opcional - URL directa PNG/JPG/WEBP)
            </label>
            <input
              type="url"
              value={settings.adBannerImg || ''}
              onChange={(e) => setSettings({ ...settings, adBannerImg: e.target.value })}
              placeholder="https://i.imgur.com/tu-banner-728x90.png"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
            <p className="text-[10px] text-slate-500">
              Si se especifica, mostrará la imagen publicitaria con enlace. Si se deja en blanco, usará el formato nativo limpio de ElysiumPad.
            </p>
          </div>
        </div>

        {/* Vista previa en vivo del banner */}
        <div className="pt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Vista previa en vivo del anuncio (Plan FREE):
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">
              {settings.adsEnabled !== false ? '● Activo en Panel y Descargas' : '○ Publicidad Desactivada'}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="bg-[#0f1420] border border-[#1d273a] rounded-xl overflow-hidden">
              <div className="h-6 px-3 bg-[#0a0e17] border-b border-[#182030] flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="uppercase tracking-wider">Publicidad</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>Eliminar anuncios con PRO</span>
                </span>
              </div>

              {settings.adBannerImg ? (
                <div className="block group relative overflow-hidden">
                  <img
                    src={settings.adBannerImg}
                    alt="Anuncio patrocinado"
                    className="w-full h-24 sm:h-28 object-cover"
                  />
                </div>
              ) : (
                <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#182236] border border-[#243350] flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        ApexHosting & FalixNodes — Servidores de Minecraft con NVMe
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {settings.adBannerText || 'Alojamiento de servidores de Minecraft de alto rendimiento • Servidores NVMe y Protección DDoS'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex-shrink-0">
                    <span>Visitar Sponsor</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
