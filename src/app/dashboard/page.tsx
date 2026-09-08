'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Loader2, Megaphone, X, Lock } from 'lucide-react';
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

  const currentLauncher = launchers.find((l) => l.slug === selectedSlug) || launchers[0];

  useEffect(() => {
    if (currentLauncher?.serverIp) {
      fetch(`/api/ping?host=${encodeURIComponent(currentLauncher.serverIp)}&port=${currentLauncher.serverPort || 25565}`)
        .then((r) => r.json())
        .then((d) => {
          setServerStatus({ online: d.online, pingMs: d.pingMs });
        })
        .catch(() => {
          setServerStatus({ online: false, pingMs: null });
        });
    } else {
      setServerStatus(null);
    }
  }, [currentLauncher?.serverIp, currentLauncher?.serverPort]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/launchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          slug: isPremium ? newSlug : undefined,
          mcVersion: newMcVersion,
          loader: newLoader,
          serverIp: newServerIp,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al crear el servidor');
      }

      await loadData();
      setSelectedSlug(data.launcher.slug);
      setIsCreateOpen(false);
      setNewName('');
      setNewSlug('');
      setNewServerIp('');
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function copyShareLink() {
    if (!currentLauncher) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/d/${currentLauncher.slug}`;
    copyToClipboard(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400 gap-3 text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
        <span>Cargando tus servidores...</span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#09090b] text-zinc-200 flex overflow-hidden font-sans">
      {/* Sidebar de navegación */}
      <AternosSidebar
        launchers={launchers}
        selectedSlug={selectedSlug}
        activeTab={activeTab}
        currentUser={currentUser}
        userPlan={userPlan}
        onSelectLauncher={(l) => {
          setSelectedSlug(l.slug);
          setActiveTab('server');
        }}
        onTabChange={(t) => setActiveTab(t)}
        onCreateOpen={() => {
          setCreateError(null);
          setIsCreateOpen(true);
        }}
        onLogout={async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/login');
        }}
        onUpgradeOpen={() => setIsUpgradeOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#09090b]">
        {/* Banner de comunicado global */}
        {globalBanner && !bannerDismissed && (
          <div
            className={`w-full px-6 py-2 flex items-center justify-between text-xs font-medium border-b ${
              globalBanner.type === 'CRITICAL'
                ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                : globalBanner.type === 'WARNING'
                ? 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2 mx-auto">
              <Megaphone className="w-3.5 h-3.5 text-zinc-400" />
              <span>{globalBanner.text}</span>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded transition"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {currentLauncher ? (
          <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
            {/* Cabecera del Servidor */}
            <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-zinc-100">{currentLauncher.name}</h1>
                  <span className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700/60 px-2 py-0.5 rounded font-mono">
                    {currentLauncher.loader} {currentLauncher.mcVersion}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        serverStatus?.online ? 'bg-emerald-500' : 'bg-zinc-600'
                      }`}
                    />
                    {currentLauncher.serverIp ? currentLauncher.serverIp : 'Sin IP asignada'}
                  </span>

                  {serverStatus && (
                    <span className="text-zinc-500">
                      • {serverStatus.online ? `Online (${serverStatus.pingMs}ms)` : 'Offline'}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={copyShareLink}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-zinc-950" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Enlace copiado' : 'Compartir con jugadores'}</span>
              </button>
            </div>

            {/* Publicidad para Plan FREE */}
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
                  <div className="bg-[#121215] border border-zinc-800 p-5 rounded-xl">
                    <span className="text-xs font-medium text-zinc-400 block">
                      Versión de Minecraft
                    </span>
                    <p className="text-xl font-bold text-zinc-100 mt-1">{currentLauncher.mcVersion}</p>
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Loader: {currentLauncher.loader}
                    </span>
                  </div>

                  <div className="bg-[#121215] border border-zinc-800 p-5 rounded-xl">
                    <span className="text-xs font-medium text-zinc-400 block">
                      Mods instalados
                    </span>
                    <p className="text-xl font-bold text-zinc-100 mt-1">{currentLauncher.mods.length}</p>
                    <button
                      onClick={() => setActiveTab('mods')}
                      className="text-[11px] text-zinc-300 hover:text-white hover:underline mt-1 block font-medium cursor-pointer"
                    >
                      Gestionar mods →
                    </button>
                  </div>

                  <div className="bg-[#121215] border border-zinc-800 p-5 rounded-xl">
                    <span className="text-xs font-medium text-zinc-400 block">
                      Tipo de acceso
                    </span>
                    <p className="text-base font-semibold text-zinc-100 mt-1">
                      {currentLauncher.allowOffline ? 'Premium & Offline' : 'Solo Oficiales'}
                    </p>
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      RAM recomendada: {currentLauncher.recommendedRamGb} GB
                    </span>
                  </div>
                </div>

                {/* Guía simple */}
                <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-200">Flujo de conexión para tus jugadores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300">
                    <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-1.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 font-semibold text-[11px] flex items-center justify-center mb-2">
                        1
                      </span>
                      <p className="font-semibold text-zinc-100">Configura tus mods</p>
                      <p className="text-zinc-400 leading-relaxed">
                        Añade mods compatibles desde la pestaña Mods en un clic con Modrinth.
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-1.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 font-semibold text-[11px] flex items-center justify-center mb-2">
                        2
                      </span>
                      <p className="font-semibold text-zinc-100">Comparte el enlace</p>
                      <p className="text-zinc-400 leading-relaxed">
                        Tus jugadores descargan el launcher preconfigurado para tu servidor.
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-1.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 font-semibold text-[11px] flex items-center justify-center mb-2">
                        3
                      </span>
                      <p className="font-semibold text-zinc-100">Sincronización en vivo</p>
                      <p className="text-zinc-400 leading-relaxed">
                        Si cambias un mod en el panel, el launcher de los jugadores se actualiza solo.
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
                onUpdated={(newSlug) => {
                  if (newSlug) setSelectedSlug(newSlug);
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
                onDeleteMod={async (id) => {
                  await fetch(`/api/launchers/${currentLauncher.slug}/mods?modId=${id}`, { method: 'DELETE' });
                  loadData();
                }}
                onDeleteCustomAsset={async (id) => {
                  await fetch(`/api/launchers/${currentLauncher.slug}/custom-assets?id=${id}`, { method: 'DELETE' });
                  loadData();
                }}
                onAssetAdded={() => loadData()}
                onUpgradeOpen={() => setIsUpgradeOpen(true)}
              />
            )}

            {/* PESTAÑA: ARCHIVOS Y CONFIGS */}
            {activeTab === 'files' && (
              <CustomAssetsManager
                launcherSlug={currentLauncher.slug}
                isFree={userPlan === 'FREE'}
                assets={currentLauncher.customAssets || []}
                onAssetChanged={() => loadData()}
                onUpgradeOpen={() => setIsUpgradeOpen(true)}
                onGoToMods={() => setActiveTab('mods')}
              />
            )}

            {/* PESTAÑA: NOTICIAS */}
            {activeTab === 'news' && (
              <TabNews
                launcher={currentLauncher}
                isFree={userPlan === 'FREE'}
                onUpdated={() => loadData()}
                onUpgradeOpen={() => setIsUpgradeOpen(true)}
              />
            )}

            {/* PESTAÑA: COMPARTIR */}
            {activeTab === 'share' && (
              <TabShare
                launcher={currentLauncher}
                isFree={userPlan === 'FREE'}
                onUpdated={() => loadData()}
                onUpgradeOpen={() => setIsUpgradeOpen(true)}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-lg font-bold text-zinc-100">No tienes ningún servidor creado</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Crea tu primer servidor para generar el launcher oficial para tu comunidad.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg text-xs transition"
            >
              Crear Servidor
            </button>
          </div>
        )}
      </main>

      {/* Modal Crear Servidor */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100">Crear Nuevo Servidor</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Nombre del Servidor</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Survival Privado"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Identificador URL (Slug)</label>
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
                    className={`w-full px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100 focus:outline-none font-mono ${
                      !isPremium
                        ? 'border-zinc-800 text-zinc-500 cursor-not-allowed pr-10'
                        : 'border-zinc-800 focus:border-zinc-500'
                    }`}
                  />
                  {!isPremium && (
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
                  )}
                </div>

                {!isPremium ? (
                  <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
                    <span>En el plan Free se asigna un enlace automático.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setIsUpgradeOpen(true);
                      }}
                      className="text-zinc-300 hover:text-white underline font-medium cursor-pointer"
                    >
                      Personalizar con PRO
                    </button>
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Enlace: <span className="text-zinc-300 font-mono">/d/{newSlug || 'tu-slug'}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Versión de Minecraft</label>
                  <select
                    value={newMcVersion}
                    onChange={(e) => setNewMcVersion(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono text-xs"
                  >
                    {availableVersions.length > 0 ? (
                      availableVersions.slice(0, 50).map((v, i) => (
                        <option key={v} value={v}>
                          {v} {i === 0 ? '(Última)' : v === '1.20.1' ? '(Recomendada)' : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="26.2">26.2 (Última)</option>
                        <option value="1.21.4">1.21.4</option>
                        <option value="1.20.1">1.20.1 (Recomendada)</option>
                        <option value="1.16.5">1.16.5</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Mod Loader</label>
                  <select
                    value={newLoader}
                    onChange={(e) => setNewLoader(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500 text-xs"
                  >
                    <option value="FABRIC">Fabric</option>
                    <option value="FORGE">Forge</option>
                    <option value="NEOFORGE">NeoForge</option>
                    <option value="QUILT">Quilt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">IP del Servidor (Opcional)</label>
                <input
                  type="text"
                  placeholder="mc.tudominio.com"
                  value={newServerIp}
                  onChange={(e) => setNewServerIp(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              {createError && (
                <div className="p-2.5 bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs rounded-lg">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-1.5 text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear Servidor'}
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
