import React, { useState, useEffect } from 'react';
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
  Wifi,
  WifiOff,
  Activity,
  Play,
  RefreshCw,
  Zap,
} from 'lucide-react';

function getRecommendedJava(mcVersion: string) {
  if (!mcVersion) return { version: 'Java 17', note: 'Estándar moderno' };
  const v = mcVersion.trim();
  if (v.startsWith('1.7') || v.startsWith('1.8') || v.startsWith('1.12') || v.startsWith('1.16')) {
    return { version: 'Java 8', note: 'Requerido para Minecraft ≤ 1.16' };
  }
  if (v.startsWith('1.17') || v.startsWith('1.18') || v.startsWith('1.19') || v === '1.20' || v.startsWith('1.20.1') || v.startsWith('1.20.2') || v.startsWith('1.20.3') || v.startsWith('1.20.4')) {
    return { version: 'Java 17', note: 'Requerido para Minecraft 1.17 - 1.20.4' };
  }
  return { version: 'Java 21', note: 'Requerido para Minecraft 1.20.5+' };
}

const JVM_PROFILES = [
  {
    id: 'AIKAR',
    name: "⚡ Aikar's Flags (FPS Boost)",
    desc: 'Optimiza el recolector G1GC para eliminar micro-tirones y congelamientos de memoria.',
    flags: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1',
  },
  {
    id: 'STANDARD',
    name: '🎮 Estándar / Balanceado',
    desc: 'Flags equilibradas estándar para cualquier ordenador.',
    flags: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200',
  },
  {
    id: 'HEAVY',
    name: '🚀 Modpacks Pesados (100+ mods)',
    desc: 'Pre-asigna memoria física y compacta cadenas de texto para evitar saturar la RAM.',
    flags: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=150 -XX:+AlwaysPreTouch -XX:+UseStringDeduplication',
  },
  {
    id: 'CUSTOM',
    name: '✏️ Flags Manuales',
    desc: 'Introduce tus propios argumentos de máquina virtual Java.',
    flags: '',
  },
];

interface TabOptionsProps {
  launcher: any;
  userPlan?: string;
  onUpdated: (newSlug?: string) => void;
  onDeleted: () => void;
  onUpgradeOpen?: () => void;
}

const COLOR_PRESETS = [
  { name: 'Esmeralda', hex: '#10b981', desc: 'Minecraft clásico' },
  { name: 'Diamante', hex: '#06b6d4', desc: 'Cian vibrante' },
  { name: 'Amatista', hex: '#a855f7', desc: 'Púrpura místico' },
  { name: 'Redstone', hex: '#ef4444', desc: 'Rojo combate' },
  { name: 'Oro Puro', hex: '#f59e0b', desc: 'Dorado cálido' },
  { name: 'Cereza', hex: '#ec4899', desc: 'Rosa sakura' },
  { name: 'Lima Cyber', hex: '#84cc16', desc: 'Verde flúor' },
  { name: 'Netherita', hex: '#64748b', desc: 'Gris moderno' },
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

  // Dirección inteligente (soporta dominio, IP, con o sin puerto ej: mc.aternos.me:12345 o play.servidor.es)
  const initialAddress = launcher.serverIp
    ? launcher.serverPort && launcher.serverPort !== 25565
      ? `${launcher.serverIp}:${launcher.serverPort}`
      : launcher.serverIp
    : '';

  const [serverAddress, setServerAddress] = useState(initialAddress);
  const [serverIp, setServerIp] = useState(launcher.serverIp || '');
  const [serverPort, setServerPort] = useState<number>(launcher.serverPort || 25565);
  const [showManualPort, setShowManualPort] = useState(false);

  // Ping test
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ online: boolean; pingMs?: number | null } | null>(null);

  const [allowOffline, setAllowOffline] = useState(launcher.allowOffline ?? true);
  const [mcVersion, setMcVersion] = useState(launcher.mcVersion || '26.2');
  const [loader, setLoader] = useState(launcher.loader || 'FABRIC');
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [ram, setRam] = useState(launcher.recommendedRamGb || 4);
  const [jvmArgs, setJvmArgs] = useState(launcher.jvmArgs || JVM_PROFILES[0].flags);
  const [jvmProfile, setJvmProfile] = useState(() => {
    if (!launcher.jvmArgs) return 'AIKAR';
    const found = JVM_PROFILES.find((p) => p.flags === launcher.jvmArgs);
    return found ? found.id : 'CUSTOM';
  });
  const [primaryColor, setPrimaryColor] = useState(launcher.primaryColor || '#10b981');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommendedJava = getRecommendedJava(mcVersion);

  useEffect(() => {
    fetch('/api/minecraft/versions')
      .then((r) => r.json())
      .then((vData) => {
        if (vData.success && Array.isArray(vData.releases)) {
          setAvailableVersions(vData.releases);
        }
      })
      .catch(() => {});
  }, []);

  // Parsear dirección unificada automáticamente
  function handleAddressChange(value: string) {
    setServerAddress(value);
    setPingResult(null);

    const trimmed = value.trim();
    if (!trimmed) {
      setServerIp('');
      setServerPort(25565);
      return;
    }

    // Detectar si el usuario pegó host:puerto (ej: mc.aternos.me:34215 o 185.22.45.10:25570)
    if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      const hostPart = parts[0].trim();
      const portPart = Number(parts[1]?.trim());

      setServerIp(hostPart);
      if (!isNaN(portPart) && portPart > 0 && portPart <= 65535) {
        setServerPort(portPart);
      }
    } else {
      setServerIp(trimmed);
      // Si no hay puerto en el texto y no se forzó manual, default 25565
      if (!showManualPort) {
        setServerPort(25565);
      }
    }
  }

  // Comprobar ping en tiempo real
  async function testServerConnection() {
    if (!serverIp) {
      setError('Por favor indica una dirección de servidor para probar.');
      return;
    }

    setPinging(true);
    setError(null);
    setPingResult(null);

    try {
      const res = await fetch(`/api/ping?host=${encodeURIComponent(serverIp)}&port=${serverPort || 25565}`);
      const data = await res.json();
      if (data.success) {
        setPingResult({ online: data.online, pingMs: data.pingMs });
      } else {
        setPingResult({ online: false, pingMs: null });
      }
    } catch {
      setPingResult({ online: false, pingMs: null });
    } finally {
      setPinging(false);
    }
  }

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
          mcVersion,
          loader,
          serverIp: serverIp.trim(),
          serverPort: Number(serverPort) || 25565,
          allowOffline,
          recommendedRamGb: Number(ram),
          jvmArgs: jvmArgs.trim(),
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
            <h3 className="text-lg font-black text-white">Configuración del Servidor & Launcher</h3>
            <p className="text-xs text-slate-400">
              Personaliza el nombre, dirección del servidor, memoria RAM recomendada y la apariencia visual.
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
              Nombre del Servidor
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
              Nombre visible en el título del launcher y página de descarga.
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

      {/* Tarjeta: Versión de Minecraft & Motor (Mod Loader) */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Versión de Minecraft & Mod Loader</h4>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sincronizado con Mojang en vivo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Versión del Juego (Catálogo Oficial Completo)
            </label>
            <select
              value={mcVersion}
              onChange={(e) => setMcVersion(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono text-xs cursor-pointer"
            >
              {availableVersions.length > 0 ? (
                availableVersions.slice(0, 60).map((v, idx) => (
                  <option key={v} className="bg-[#111622] text-slate-100" value={v}>
                    {v} {idx === 0 ? '★ (Última versión oficial)' : v === '1.20.1' ? '(Recomendada para mods)' : ''}
                  </option>
                ))
              ) : (
                <>
                  <option className="bg-[#111622] text-slate-100" value="26.2">26.2 ★ (Última oficial)</option>
                  <option className="bg-[#111622] text-slate-100" value="26.1">26.1</option>
                  <option className="bg-[#111622] text-slate-100" value="1.21.4">1.21.4</option>
                  <option className="bg-[#111622] text-slate-100" value="1.21.1">1.21.1</option>
                  <option className="bg-[#111622] text-slate-100" value="1.20.4">1.20.4</option>
                  <option className="bg-[#111622] text-slate-100" value="1.20.1">1.20.1 (Recomendada)</option>
                  <option className="bg-[#111622] text-slate-100" value="1.19.2">1.19.2</option>
                  <option className="bg-[#111622] text-slate-100" value="1.16.5">1.16.5</option>
                </>
              )}
            </select>
            <div className="mt-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between">
              <span className="text-slate-400">Entorno Java Automático:</span>
              <span className="text-amber-300 font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                {recommendedJava.version} ({recommendedJava.note})
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Cargador de Mods (Mod Loader)
            </label>
            <select
              value={loader}
              onChange={(e) => setLoader(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono text-xs cursor-pointer"
            >
              <option className="bg-[#111622] text-slate-100" value="FABRIC">Fabric (Rápido, shaders y rendimiento)</option>
              <option className="bg-[#111622] text-slate-100" value="FORGE">Forge (Ecosistema tradicional de mods)</option>
              <option className="bg-[#111622] text-slate-100" value="NEOFORGE">NeoForge (Minecraft 1.20.2+)</option>
              <option className="bg-[#111622] text-slate-100" value="QUILT">Quilt (Modular y compatible)</option>
              <option className="bg-[#111622] text-slate-100" value="VANILLA">Vanilla (Sin mods / Servidor puro)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-2">
              El launcher de tus jugadores detectará el motor elegido y descargará las librerías oficiales automáticamente sin que tengan que instalar nada manual.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Conexión al Servidor de Minecraft (Intuitiva: IP / Dominio y Puerto en un solo campo inteligente) */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Conexión al Servidor Minecraft</h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Pega tu IP o Dominio con o sin puerto
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Campo unificado inteligente */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Dirección de Conexión del Servidor (IP o Dominio)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ej: mc.amigos.es o smp.aternos.me:34215 o 185.22.45.10"
                  value={serverAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
                {serverAddress && (
                  <button
                    type="button"
                    onClick={() => handleAddressChange('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition text-xs"
                    title="Limpiar"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Botón Probar Conexión */}
              <button
                type="button"
                disabled={pinging || !serverIp}
                onClick={testServerConnection}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                {pinging ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Comprobando...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Comprobar Estado</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Detecta automáticamente si incluyes el puerto (ej: <code className="text-slate-400">servidor.aternos.me:12345</code>) o si es un dominio estándar (puerto por defecto 25565).
            </p>
          </div>

          {/* Desglose visual de host y puerto */}
          {serverIp && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Dominio / IP:</span>
                  <span className="font-mono text-emerald-400 font-bold">{serverIp}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Puerto:</span>
                  {showManualPort ? (
                    <input
                      type="number"
                      value={serverPort}
                      onChange={(e) => setServerPort(Number(e.target.value))}
                      className="w-16 bg-slate-950 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white font-mono"
                    />
                  ) : (
                    <span className="font-mono text-cyan-400 font-bold">{serverPort}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowManualPort(!showManualPort)}
                  className="text-[10px] text-slate-400 hover:text-slate-200 underline transition"
                >
                  {showManualPort ? 'Fijar' : 'Cambiar puerto manual'}
                </button>
              </div>

              {/* Resultado del Ping */}
              {pingResult && (
                <div className="flex items-center gap-2">
                  {pingResult.online ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Online {pingResult.pingMs ? `(${pingResult.pingMs} ms)` : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      No responde o servidor apagado
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tarjeta 3: Rendimiento & RAM Recomendada con Optimizador Java */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Rendimiento, RAM & Optimizador Java</h4>
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

          {/* Sección Optimizador Java & Argumentos JVM */}
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">Optimizador de Java & Flags de Rendimiento</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
                <span>Versión Recomendada:</span>
                <strong>{recommendedJava.version}</strong>
              </span>
            </div>

            {/* Perfiles JVM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {JVM_PROFILES.map((profile) => {
                const isSelected = jvmProfile === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      setJvmProfile(profile.id);
                      if (profile.id !== 'CUSTOM') {
                        setJvmArgs(profile.flags);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900/60 hover:text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-xs block text-slate-200">{profile.name}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{profile.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Cuadro de Flags Activas */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400">
                Argumentos JVM Activos para el Launcher:
              </label>
              <textarea
                rows={2}
                value={jvmArgs}
                onChange={(e) => {
                  setJvmArgs(e.target.value);
                  setJvmProfile('CUSTOM');
                }}
                placeholder="-XX:+UseG1GC..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500">
                Estas flags eliminan micro-congelamientos de FPS gestionando automáticamente la recolección de basura de Java.
              </p>
            </div>
          </div>
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

      {/* Tarjeta 5: Personalización Visual & Color de Acento con Vista Previa en Vivo */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Personalización & Color de Acento</h4>
          </div>
          <span className="text-[11px] text-slate-400">
            El color principal de los botones y detalles de tu launcher
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Selector de Paletas (8 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {COLOR_PRESETS.map((color) => {
                const isSelected = primaryColor.toLowerCase() === color.hex.toLowerCase();
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setPrimaryColor(color.hex)}
                    className={`p-2.5 rounded-xl border text-left transition relative group ${
                      isSelected
                        ? 'border-white bg-slate-800/90 shadow-lg'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-4 h-4 rounded-full shadow-md"
                        style={{ backgroundColor: color.hex }}
                      />
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="font-bold text-white text-xs block truncate">{color.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{color.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Selector de Color Libre */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-300">¿Quieres otro color específico?</span>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                />
                <input
                  type="text"
                  value={primaryColor.toUpperCase()}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white text-center uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Miniatura de Vista Previa del Launcher en Vivo (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold flex items-center gap-1.5 text-white">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Vista Previa en el Launcher
              </span>
              <span className="font-mono text-[10px] uppercase text-slate-500">Demo en Vivo</span>
            </div>

            {/* Simulación del botón de juego del launcher */}
            <div className="bg-[#0f1420] border border-slate-800/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white truncate max-w-[140px]">{name || 'Mi Servidor'}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    color: primaryColor,
                    borderColor: `${primaryColor}40`,
                    backgroundColor: `${primaryColor}15`,
                  }}
                >
                  {launcher.loader || 'Fabric'} {launcher.mcVersion || '1.20.1'}
                </span>
              </div>

              {/* Botón Principal simulado con el color seleccionado */}
              <button
                type="button"
                className="w-full py-2.5 rounded-xl font-black text-xs text-slate-950 transition flex items-center justify-center gap-2 shadow-lg"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 8px 20px -4px ${primaryColor}60`,
                }}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>JUGAR MINECRAFT</span>
              </button>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  {serverIp ? `${serverIp}:${serverPort}` : 'Sin IP'}
                </span>
                <span>{ram} GB RAM</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              Así es como tus jugadores verán el botón y los detalles del launcher.
            </p>
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
