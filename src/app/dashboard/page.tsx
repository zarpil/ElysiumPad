'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Loader2, Megaphone, X, Crown, Lock, Sparkles } from 'lucide-react';
import { AternosSidebar, ActiveTab } from '@/components/AternosSidebar';
import { TabOptions } from '@/components/TabOptions';
import { TabMods } from '@/components/TabMods';
import { TabShare } from '@/components/TabShare';
import { TabNews } from '@/components/TabNews';
import { CustomAssetsManager } from '@/components/CustomAssetsManager';
import { ModSearchModal } from '@/components/ModSearchModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { AdBanner } from '@/components/AdBanner';
import { copyToClipboard } from '@/lib/clipboard';

export default function DashboardPage() {
  const router = useRouter();
  const [launchers, setLaunchers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<string>('FREE');
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('server');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isModSearchOpen, setIsModSearchOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ online: boolean; pingMs: number | null } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [globalBanner, setGlobalBanner] = useState<{ text: string; type: string } | null>(null);
  const [adSettings, setAdSettings] = useState<any>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Formulario nuevo servidor
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newMcVersion, setNewMcVersion] = useState('26.2');
  const [newLoader, setNewLoader] = useState('FABRIC');
  const [newServerIp, setNewServerIp] = useState('');
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const isPremium = userPlan === 'PRO' || userPlan === 'LIFETIME' || currentUser?.role === 'ADMIN';

  async function loadData() {
    try {
      // Cargar versiones oficiales de Minecraft en paralelo
      fetch('/api/minecraft/versions')
        .then((r) => r.json())
        .then((vData) => {
          if (vData.success && Array.isArray(vData.releases)) {
            setAvailableVersions(vData.releases);
            if (vData.latest?.release) {
              setNewMcVersion(vData.latest.release);
            }
          }
        })
        .catch(() => {});

      const [launchersRes, settingsRes] = await Promise.all([
        fetch('/api/launchers'),
        fetch('/api/settings/public'),
      ]);
      const data = await launchersRes.json();
      const settingsData = await settingsRes.json();

      if (launchersRes.status === 401 || (!data.success && data.error?.includes('No autenticado'))) {
        router.push('/login?redirect=/dashboard');
        return;
      }

      if (data.success) {
        setLaunchers(data.launchers);
        setUserPlan(data.userPlan);
        setCurrentUser(data.user);
        if (data.launchers.length > 0 && !selectedSlug) {
          setSelectedSlug(data.launchers[0].slug);
        }
      }

      if (settingsData.success && settingsData.settings) {
        setAdSettings(settingsData.settings);
        if (settingsData.settings.bannerAnnouncement) {
          setGlobalBanner({
            text: settingsData.settings.bannerAnnouncement,
            type: settingsData.settings.bannerType || 'INFO',
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const currentLauncher = launchers.find((l) => l.slug === selectedSlug);

  useEffect(() => {
    if (!currentLauncher?.serverIp) {
      setServerStatus(null);
      return;
    }
    fetch(`/api/ping?host=${encodeURIComponent(currentLauncher.serverIp)}&port=${currentLauncher.serverPort || 25565}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setServerStatus({ online: d.online, pingMs: d.pingMs });
      })
      .catch(() => setServerStatus({ online: false, pingMs: null }));
  }, [currentLauncher?.serverIp, currentLauncher?.serverPort]);

  async function handleCreateLauncher(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/launchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          slug: newSlug,
          mcVersion: newMcVersion,
          loader: newLoader,
          serverIp: newServerIp.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al crear');

      setIsCreateOpen(false);
      setNewName('');
      setNewSlug('');
      setNewServerIp('');
      await loadData();
      setSelectedSlug(data.launcher.slug);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteMod(modId: string) {
    if (!currentLauncher) return;
    try {
      await fetch(`/api/launchers/${currentLauncher.slug}/mods?modId=${modId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteCustomAsset(assetId: string) {
    if (!currentLauncher) return;
    try {
      await fetch(`/api/launchers/${currentLauncher.slug}/custom-assets?assetId=${assetId}`, {
        method: 'DELETE',
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function copyShareLink() {
    if (!currentLauncher) return;
    const url = `${window.location.origin}/d/${currentLauncher.slug}`;
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  return (
    <div className="flex h-screen w-full bg-[#0b0f17] text-slate-100 overflow-hidden font-sans antialiased">
      <AternosSidebar
        launchers={launchers}
        selectedSlug={selectedSlug}
        activeTab={activeTab}
        currentUser={currentUser}
        userPlan={userPlan}
        onSelectLauncher={(l) => setSelectedSlug(l.slug)}
        onTabChange={setActiveTab}
        onCreateOpen={() => {
          if (!isPremium) {
            setNewSlug(`srv-${Math.random().toString(36).substring(2, 8)}`);
          } else {
            setNewSlug('');
          }
          setIsCreateOpen(true);
        }}
        onLogout={async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/login');
        }}
        onUpgradeOpen={() => setIsUpgradeOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0d121d]">
        {/* Global Announcement Banner from SuperAdmin */}
        {globalBanner && !bannerDismissed && (
          <div
            className={`w-full px-6 py-2.5 flex items-center justify-between text-xs font-semibold border-b transition-all ${
              globalBanner.type === 'CRITICAL'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : globalBanner.type === 'WARNING'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : globalBanner.type === 'PROMO'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <div className="flex items-center gap-2.5 mx-auto">
              <Megaphone className="w-4 h-4 flex-shrink-0 animate-bounce" />
              <span>{globalBanner.text}</span>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 hover:bg-white/10 rounded-lg transition"
              title="Cerrar anuncio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentLauncher ? (
          <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
            {/* Header del Servidor */}
            <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-white">{currentLauncher.name}</h1>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    {currentLauncher.loader} {currentLauncher.mcVersion}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        serverStatus?.online ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-500'
                      }`}
                    />
                    {currentLauncher.serverIp ? currentLauncher.serverIp : 'Sin IP configurada'}
                  </span>

                  {serverStatus && (
                    <span className="text-[11px] text-slate-500">
                      • {serverStatus.online ? `Online (${serverStatus.pingMs}ms)` : 'Offline'}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={copyShareLink}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? '¡Link Copiado!' : 'Copiar Link para Amigos'}</span>
              </button>
            </div>

            {/* Ad Banner para usuarios del Plan FREE (estilo Aternos) */}
            {userPlan === 'FREE' && (adSettings?.adsEnabled ?? true) && (
              <AdBanner
                onUpgrade={() => setIsUpgradeOpen(true)}
                adData={adSettings}
              />
            )}

            {/* PESTAÑA: SERVIDOR */}
            {activeTab === 'server' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#141a29] border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Versión de Minecraft
                    </span>
                    <p className="text-2xl font-black text-white mt-1">{currentLauncher.mcVersion}</p>
                    <span className="text-[11px] text-emerald-400 mt-1 block font-medium">
                      Loader: {currentLauncher.loader}
                    </span>
                  </div>

                  <div className="bg-[#141a29] border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Mods Instalados
                    </span>
                    <p className="text-2xl font-black text-white mt-1">{currentLauncher.mods.length}</p>
                    <button
                      onClick={() => setActiveTab('mods')}
                      className="text-[11px] text-indigo-400 hover:underline mt-1 block font-medium"
                    >
                      Administrar mods →
                    </button>
                  </div>

                  <div className="bg-[#141a29] border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Acceso de Cuentas
                    </span>
                    <p className="text-lg font-bold text-white mt-1">
                      {currentLauncher.allowOffline ? 'Premium & No-Premium' : 'Solo Oficiales'}
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      RAM recom.: {currentLauncher.recommendedRamGb} GB
                    </span>
                  </div>
                </div>

                <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white">¿Cómo funciona para tus amigos?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center mb-2">
                        1
                      </span>
                      <p className="font-bold text-white">Configura tus mods</p>
                      <p className="text-slate-400 leading-relaxed">
                        Busca mods en la pestaña Mods. Se añaden con 1 clic directo desde Modrinth.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center mb-2">
                        2
                      </span>
                      <p className="font-bold text-white">Pasa el link a tus amigos</p>
                      <p className="text-slate-400 leading-relaxed">
                        Comparte la página de descarga. Ellos solo descargan el ejecutable listo para jugar.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center mb-2">
                        3
                      </span>
                      <p className="font-bold text-white">Sincronización automática</p>
                      <p className="text-slate-400 leading-relaxed">
                        Si agregas un mod mañana en la web, el launcher de tus amigos se actualiza solo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: OPCIONES */}
            {activeTab === 'options' && (
              <TabOptions
                launcher={currentLauncher}
                userPlan={userPlan}
                onUpdated={(newSlug?: string) => {
                  if (newSlug && newSlug !== selectedSlug) {
                    setSelectedSlug(newSlug);
                  }
                  loadData();
                }}
                onDeleted={() => {
                  setSelectedSlug(null);
                  loadData();
                }}
                onUpgradeOpen={() => setIsUpgradeOpen(true)}
              />
            )}

            {/* PESTAÑA: MODS */}
            {activeTab === 'mods' && (
              <TabMods
                mods={currentLauncher.mods}
                customAssets={currentLauncher.customAssets || []}
                launcherSlug={currentLauncher.slug}
                isFree={userPlan === 'FREE'}
                onOpenSearch={() => setIsModSearchOpen(true)}
                onDeleteMod={handleDeleteMod}
                onDeleteCustomAsset={handleDeleteCustomAsset}
                onAssetAdded={loadData}
                onUpgradeOpen={() => setIsUpgradeOpen(true)}
              />
            )}

            {/* PESTAÑA: ARCHIVOS Y CONFIGS */}
            {activeTab === 'files' && (
              <CustomAssetsManager
                launcherSlug={currentLauncher.slug}
                isFree={userPlan === 'FREE'}
                assets={currentLauncher.customAssets || []}
                onAssetChanged={loadData}
                onUpgradeOpen={() => setIsUpgradeOpen(true)}
                onGoToMods={() => setActiveTab('mods')}
              />
            )}

            {/* PESTAÑA: NOTICIAS & ANUNCIOS (PRO) */}
            {activeTab === 'news' && (
              <TabNews
                launcher={currentLauncher}
                isFree={userPlan === 'FREE'}
                onUpdated={loadData}
                onUpgradeOpen={() => setIsUpgradeOpen(true)}
              />
            )}

            {/* PESTAÑA: COMPARTIR */}
            {activeTab === 'share' && (
              <TabShare
                launcher={currentLauncher}
                isFree={userPlan === 'FREE'}
                onUpdated={loadData}
                onUpgradeOpen={() => setIsUpgradeOpen(true)}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            ) : (
              <div className="max-w-md space-y-4">
                <h2 className="text-xl font-bold text-white">¡No tienes servidores todavía!</h2>
                <p className="text-xs text-slate-400">
                  Crea tu primer servidor de Minecraft para empezar a armar tu launcher.
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs transition"
                >
                  Crear Mi Primer Servidor
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Crear */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141a29] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Crear Nuevo Servidor</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLauncher} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre del Servidor</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Survival Amigos T4"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (isPremium && !newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-300">
                    Slug URL (Página de Descarga)
                  </label>
                  {!isPremium && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setIsUpgradeOpen(true);
                      }}
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
                    required
                    readOnly={!isPremium}
                    placeholder={isPremium ? 'survival-amigos' : 'srv-xxxxxx'}
                    value={newSlug}
                    onChange={(e) => {
                      if (isPremium) {
                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white focus:outline-none font-mono ${
                      !isPremium
                        ? 'border-slate-800 text-slate-400 cursor-not-allowed bg-slate-950/80 pr-10'
                        : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {!isPremium && (
                    <Lock className="w-4 h-4 text-amber-400/80 absolute right-3 top-3 pointer-events-none" />
                  )}
                </div>

                {!isPremium ? (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>En el plan Free se asigna un enlace aleatorio.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setIsUpgradeOpen(true);
                      }}
                      className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Personalizar con PRO
                    </button>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enlace público: <span className="text-emerald-400 font-mono">/d/{newSlug || 'tu-slug'}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Versión de Minecraft</label>
                  <select
                    value={newMcVersion}
                    onChange={(e) => setNewMcVersion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  >
                    {availableVersions.length > 0 ? (
                      availableVersions.slice(0, 50).map((v, i) => (
                        <option key={v} className="bg-[#111622] text-slate-100" value={v}>
                          {v} {i === 0 ? '★ (Última versión oficial)' : v === '1.20.1' ? '(Recomendada mods)' : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option className="bg-[#111622] text-slate-100" value="26.2">26.2 ★ (Última versión oficial)</option>
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
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mod Loader</label>
                  <select
                    value={newLoader}
                    onChange={(e) => setNewLoader(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option className="bg-[#111622] text-slate-100" value="FABRIC">Fabric (Rápido)</option>
                    <option className="bg-[#111622] text-slate-100" value="FORGE">Forge</option>
                    <option className="bg-[#111622] text-slate-100" value="NEOFORGE">NeoForge</option>
                    <option className="bg-[#111622] text-slate-100" value="QUILT">Quilt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">IP del Servidor (Opcional)</label>
                <input
                  type="text"
                  placeholder="mc.amigos.es"
                  value={newServerIp}
                  onChange={(e) => setNewServerIp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {createError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition"
                >
                  {creating ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentLauncher && (
        <ModSearchModal
          isOpen={isModSearchOpen}
          onClose={() => setIsModSearchOpen(false)}
          launcherSlug={currentLauncher.slug}
          mcVersion={currentLauncher.mcVersion}
          loader={currentLauncher.loader}
          existingModrinthIds={currentLauncher.mods.map((m: any) => m.modrinthId).filter(Boolean)}
          onModAdded={() => loadData()}
        />
      )}

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSuccess={() => loadData()}
        currentPlan={userPlan}
      />
    </div>
  );
}
