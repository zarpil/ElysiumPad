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
  Mail,
  Send,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  ExternalLink,
  Code,
  Globe,
  Monitor,
  HelpCircle,
} from 'lucide-react';

interface SettingsProps {
  initialSettings: any;
  onRefresh: () => void;
}

export function AdminTabSettings({ initialSettings, onRefresh }: SettingsProps) {
  const [settings, setSettings] = useState<any>(initialSettings || {});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingAd, setIsUploadingAd] = useState(false);

  // Test email Resend state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleAdBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (PNG, JPG, WEBP)');
      return;
    }

    setIsUploadingAd(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'adbanner');
      formData.append('slug', 'global');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al subir banner publicitario');
      }

      setSettings((prev: any) => ({ ...prev, adBannerImg: data.url }));
    } catch (err: any) {
      alert(err.message || 'Error al subir imagen');
    } finally {
      setIsUploadingAd(false);
    }
  }


  async function handleSendTestEmail() {
    if (!testEmail || !testEmail.includes('@')) {
      alert('Ingresa un correo electrónico válido');
      return;
    }
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/resend/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: testEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error || 'Error al enviar correo' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error de conexión' });
    } finally {
      setSendingTest(false);
    }
  }

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
                <option className="bg-[#111622] text-slate-100" value="INFO">Información (Azul / Cyan)</option>
                <option className="bg-[#111622] text-slate-100" value="WARNING">Advertencia (Ámbar / Amarillo)</option>
                <option className="bg-[#111622] text-slate-100" value="CRITICAL">Urgente / Crítico (Rojo / Rose)</option>
                <option className="bg-[#111622] text-slate-100" value="PROMO">Promoción / Éxito (Verde Esmeralda)</option>
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

      {/* Publicidad y Redes de Anuncios (AdMaven, Sponsors, Scripts - Plan FREE) */}
      <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Monetización y Redes de Anuncios (Plan FREE)
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Monetiza a los usuarios del plan gratuito en el panel web, en las páginas de descarga pública y en el launcher con AdMaven, patrocinadores directos o scripts de terceros.
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

        {/* Selector de Red / Proveedor de Publicidad */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-slate-300">
            Proveedor o Red Publicitaria
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, adProvider: 'ADMAVEN' })}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                settings.adProvider === 'ADMAVEN'
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> AdMaven
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Red publicitaria de alto eCPM. Soporta banners display, In-Page Push y popunders.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, adProvider: 'CUSTOM' })}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                (!settings.adProvider || settings.adProvider === 'CUSTOM')
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Sponsor Directo
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                  Afiliados
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Banner gráfico personalizado (728x90) con tu enlace de afiliado o patrocinador.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, adProvider: 'SCRIPT' })}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                settings.adProvider === 'SCRIPT'
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyan-400" /> Script / AdSense
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                  HTML / JS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Incrusta cualquier código HTML o JavaScript de Google AdSense u otras redes publicitarias.
              </p>
            </button>
          </div>
        </div>

        {/* Guía y Configuración de AdMaven */}
        {settings.adProvider === 'ADMAVEN' && (
          <div className="space-y-4 pt-1">
            {/* Tarjeta de Guía de Registro en AdMaven */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 rounded-lg">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      ¿Cómo registrarte y obtener tus códigos de AdMaven?
                    </h5>
                    <p className="text-[11px] text-emerald-300/80">
                      AdMaven te paga por cada impresión y clic que generen los usuarios de tus launchers y web.
                    </p>
                  </div>
                </div>

                <a
                  href="https://publishers.ad-maven.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-sm self-start sm:self-auto shrink-0"
                >
                  <span>Registrarse en AdMaven</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1.5 border-t border-emerald-800/30 pt-2.5">
                <p className="font-semibold text-emerald-200">Pasos para activar tus anuncios:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                  <li>Crea tu cuenta de publisher en <strong>publishers.ad-maven.com</strong> y añade tu dominio (ej: <code className="text-slate-200 bg-slate-900 px-1 rounded">elysiumpad.com</code>).</li>
                  <li>En el panel de AdMaven, ve a <strong>Ad Units</strong> y crea un <strong>Banner (728×90 o Native Widget)</strong>. Copia el código y pégalo abajo en <em>"Código de Banner AdMaven"</em>.</li>
                  <li>(Opcional) Crea un formato <strong>In-Page Push</strong> o <strong>Popunder</strong> y pega el script en <em>"Script Global de AdMaven"</em> para monetizar visitas en la web.</li>
                  <li>(Opcional) Crea un <strong>Direct Link / SmartLink</strong> y pégalo en <em>"SmartLink de AdMaven"</em>.</li>
                </ol>
              </div>
            </div>

            {/* Campos de AdMaven */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Código de Banner AdMaven (HTML / Script / Iframe para Web y Launcher)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Recomendado: 728×90 px</span>
                </label>
                <textarea
                  rows={4}
                  value={settings.adMavenBannerHtml || ''}
                  onChange={(e) => setSettings({ ...settings, adMavenBannerHtml: e.target.value })}
                  placeholder={'<!-- Código de AdMaven Banner aquí -->\n<script data-cfasync="false" type="text/javascript" src="//..."></script>\n<div id="admaven-banner-zone"></div>'}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono leading-relaxed"
                />
                <p className="text-[10px] text-slate-500">
                  Este código se renderiza dentro del dock inferior del launcher de los servidores FREE y en los contenedores publicitarios de la web.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Script Global de AdMaven (In-Page Push / Anti-Adblock)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.adMavenTagScript || ''}
                    onChange={(e) => setSettings({ ...settings, adMavenTagScript: e.target.value })}
                    placeholder={'<script data-cfasync="false" src="//tag.ad-maven.com/..."></script>'}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Se inyecta en el panel web y en la página de descarga pública para usuarios del plan FREE.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    SmartLink / Direct Link de AdMaven (Opcional)
                  </label>
                  <input
                    type="url"
                    value={settings.adMavenPopunderUrl || ''}
                    onChange={(e) => setSettings({ ...settings, adMavenPopunderUrl: e.target.value })}
                    placeholder="https://ad-maven.com/link?zone=123456"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Enlace de monetización al hacer clic en el botón de sponsor o al iniciar la descarga.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuración de Sponsor Directo (CUSTOM) */}
        {(!settings.adProvider || settings.adProvider === 'CUSTOM') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
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

            <div className="space-y-3 md:col-span-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Imagen Gráfica del Banner Publicitario (Opcional)</span>
                </label>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] font-semibold text-amber-400 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Recomendado para Launcher: <strong>728 × 90 px</strong> (Leaderboard) u <strong>800 × 100 px</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Esta proporción horizontal encaja en el dock inferior del launcher sin distorsionarse.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
                <div className="md:col-span-8">
                  <input
                    type="url"
                    value={settings.adBannerImg || ''}
                    onChange={(e) => setSettings({ ...settings, adBannerImg: e.target.value })}
                    placeholder="https://i.imgur.com/tu-banner-728x90.png o sube una imagen"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                </div>

                <div className="md:col-span-4 flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer">
                    {isUploadingAd ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Subir Banner</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      disabled={isUploadingAd}
                      onChange={handleAdBannerUpload}
                    />
                  </label>

                  {settings.adBannerImg && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, adBannerImg: '' })}
                      title="Quitar imagen"
                      className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuración de Script Personalizado (SCRIPT) */}
        {settings.adProvider === 'SCRIPT' && (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-300">
              Código HTML / JavaScript del Anuncio
            </label>
            <textarea
              rows={5}
              value={settings.adCustomScript || ''}
              onChange={(e) => setSettings({ ...settings, adCustomScript: e.target.value })}
              placeholder={'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>\n<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" ...></ins>'}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono leading-relaxed"
            />
            <p className="text-[10px] text-slate-500">
              Se renderizará de forma aislada y segura en los contenedores de anuncios tanto de la web como del launcher.
            </p>
          </div>
        )}

        {/* Ubicaciones de los Anuncios (Placements) */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            Ubicaciones Activas para Usuarios en Plan FREE
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition">
              <div>
                <p className="text-xs font-semibold text-white">Panel Web (Dashboard)</p>
                <p className="text-[10px] text-slate-500">Banner en el panel de control</p>
              </div>
              <input
                type="checkbox"
                checked={settings.adsWebDashboard !== false}
                onChange={(e) => setSettings({ ...settings, adsWebDashboard: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
            </label>

            <label className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition">
              <div>
                <p className="text-xs font-semibold text-white">Página de Descarga</p>
                <p className="text-[10px] text-slate-500">En /d/[slug] de servidores free</p>
              </div>
              <input
                type="checkbox"
                checked={settings.adsWebDownload !== false}
                onChange={(e) => setSettings({ ...settings, adsWebDownload: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
            </label>

            <label className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition">
              <div>
                <p className="text-xs font-semibold text-white">Launcher Comercial</p>
                <p className="text-[10px] text-slate-500">Dock inferior del juego</p>
              </div>
              <input
                type="checkbox"
                checked={settings.adsLauncher !== false}
                onChange={(e) => setSettings({ ...settings, adsLauncher: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Vista previa en vivo del banner */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Vista previa en vivo del anuncio (Plan FREE):
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">
              {settings.adsEnabled !== false ? '● Activo en ubicaciones seleccionadas' : '○ Publicidad Desactivada'}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="bg-[#0f1420] border border-[#1d273a] rounded-xl overflow-hidden">
              <div className="h-6 px-3 bg-[#0a0e17] border-b border-[#182030] flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="uppercase tracking-wider font-mono text-[9px]">
                  {settings.adProvider === 'ADMAVEN' ? 'AdMaven Banner Widget' : settings.adProvider === 'SCRIPT' ? 'Script Banner' : 'Sponsor Directo'}
                </span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>Sin publicidad en Plan PRO</span>
                </span>
              </div>

              {settings.adProvider === 'ADMAVEN' && settings.adMavenBannerHtml ? (
                <div className="w-full flex items-center justify-center p-1 bg-[#0a0e17] overflow-hidden min-h-[80px]">
                  <iframe
                    srcDoc={`<!DOCTYPE html><html><head><base target="_blank"><style>body{margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;overflow:hidden;font-family:sans-serif;color:#94a3b8;font-size:12px;}</style></head><body>${settings.adMavenBannerHtml}</body></html>`}
                    title="AdMaven Preview"
                    className="w-full h-24 sm:h-28 border-0"
                    sandbox="allow-scripts allow-popups allow-same-origin allow-forms"
                  />
                </div>
              ) : settings.adProvider === 'SCRIPT' && settings.adCustomScript ? (
                <div className="w-full flex items-center justify-center p-1 bg-[#0a0e17] overflow-hidden min-h-[80px]">
                  <iframe
                    srcDoc={`<!DOCTYPE html><html><head><base target="_blank"><style>body{margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;overflow:hidden;font-family:sans-serif;color:#94a3b8;font-size:12px;}</style></head><body>${settings.adCustomScript}</body></html>`}
                    title="Script Preview"
                    className="w-full h-24 sm:h-28 border-0"
                    sandbox="allow-scripts allow-popups allow-same-origin allow-forms"
                  />
                </div>
              ) : settings.adBannerImg ? (
                <div className="block group relative overflow-hidden bg-black/40 p-2 flex items-center justify-center min-h-[64px]">
                  <img
                    src={settings.adBannerImg}
                    alt="Anuncio patrocinado"
                    className="h-14 sm:h-16 w-auto max-w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <span className="absolute bottom-2 right-2 text-[9px] font-mono text-amber-400/80 bg-black/80 px-1.5 py-0.5 rounded border border-amber-500/20 backdrop-blur-sm">
                    728×90 / 800×100
                  </span>
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

      {/* Servicio de Correos Transaccionales (Resend.com) */}
      <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Servicio de Correos Transaccionales (Resend.com)</span>
          </h4>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
            resend.com
          </span>
        </div>

        <p className="text-xs text-slate-400">
          ElysiumPad envía correos automáticos de bienvenida a nuevos usuarios y confirmaciones de compra premium utilizando la API de Resend.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Eventos Transaccionales Activos</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bienvenida tras registro de usuario nuevo</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Activación de suscripción PRO o LIFETIME</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Probar Envío de Correo</span>
              <span className="text-[10px] text-slate-500">Prueba en Vivo</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="tu-correo@ejemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTest || !testEmail}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-cyan-950/40 disabled:opacity-50 shrink-0"
              >
                {sendingTest ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Enviar Test</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
