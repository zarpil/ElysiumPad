'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  KeyRound,
  Server,
  Download,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Calendar,
  CreditCard,
  LogOut,
  Save,
  Loader2,
  Lock,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { UpgradeModal } from '@/components/UpgradeModal';
import { copyToClipboard } from '@/lib/clipboard';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'servers' | 'account' | 'security' | 'billing'>('servers');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Edit profile form
  const [name, setName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security / Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Copy helper
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Cancellation state
  const [cancellingSub, setCancellingSub] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  async function handleCancelSubscription() {
    setCancellingSub(true);
    setCancelError(null);
    setCancelSuccess(null);

    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al cancelar la suscripción');
      }
      setCancelSuccess(data.message);
      setIsConfirmCancelOpen(false);
      await loadProfile();
    } catch (err: any) {
      setCancelError(err.message);
    } finally {
      setCancellingSub(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await fetch('/api/user/profile');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.success && data.user) {
        setProfile(data.user);
        setName(data.user.name || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al actualizar el nombre');
      }
      setProfileSuccess(true);
      await loadProfile();
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleCopyDownloadLink(slug: string) {
    const url = `${window.location.origin}/d/${slug}`;
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const isFree = profile.plan === 'FREE';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Panel</span>
          </Link>

          <div className="h-4 w-px bg-zinc-800" />

          <span className="text-sm font-semibold text-zinc-200 tracking-tight">Mi Perfil y Ajustes</span>
        </div>

        <div className="flex items-center gap-3">
          {profile.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium rounded-lg transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
              <span>SuperAdmin</span>
            </Link>
          )}

          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition px-2.5 py-1.5 rounded-lg hover:bg-zinc-900"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-6">
        {/* User Identity Header Card */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-semibold text-zinc-200 text-lg flex-shrink-0">
              {(profile.name || profile.email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-white tracking-tight">
                  {profile.name || 'Usuario de ElysiumPad'}
                </h1>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                    profile.plan === 'LIFETIME'
                      ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                      : profile.plan === 'PRO'
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Plan {profile.plan}
                </span>
                {profile.role === 'ADMIN' && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Administrador
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono">{profile.email}</p>
              <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Miembro desde:{' '}
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>ID: {profile.id.slice(0, 10)}...</span>
              </div>
            </div>
          </div>

          {isFree && (
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer flex-shrink-0 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mejorar a Plan PRO</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('servers')}
            className={`px-4 py-2.5 text-xs font-medium transition flex items-center gap-2 flex-shrink-0 rounded-t-lg border-b-2 ${
              activeTab === 'servers'
                ? 'border-white text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Mis Servidores ({profile.launchers?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2.5 text-xs font-medium transition flex items-center gap-2 flex-shrink-0 rounded-t-lg border-b-2 ${
              activeTab === 'account'
                ? 'border-white text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Datos de la Cuenta</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 text-xs font-medium transition flex items-center gap-2 flex-shrink-0 rounded-t-lg border-b-2 ${
              activeTab === 'security'
                ? 'border-white text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Seguridad y Contraseña</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2.5 text-xs font-medium transition flex items-center gap-2 flex-shrink-0 rounded-t-lg border-b-2 ${
              activeTab === 'billing'
                ? 'border-white text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Plan y Suscripción</span>
          </button>
        </div>

        {/* TAB CONTENT: SERVERS */}
        {activeTab === 'servers' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-medium">Servidores Activos</span>
                  <p className="text-2xl font-bold text-white mt-1">{profile.stats?.totalLaunchers || 0}</p>
                </div>
                <div className="p-2.5 bg-zinc-800/80 text-zinc-300 rounded-lg">
                  <Server className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-medium">Descargas Totales</span>
                  <p className="text-2xl font-bold text-white mt-1">{profile.stats?.totalDownloads || 0}</p>
                </div>
                <div className="p-2.5 bg-zinc-800/80 text-zinc-300 rounded-lg">
                  <Download className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-medium">Mods Sincronizados</span>
                  <p className="text-2xl font-bold text-white mt-1">{profile.stats?.totalMods || 0}</p>
                </div>
                <div className="p-2.5 bg-zinc-800/80 text-zinc-300 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Server List */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Listado de Servidores Creados</h3>
                <Link
                  href="/dashboard"
                  className="text-xs text-zinc-300 hover:text-white font-medium flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Nuevo Servidor en Panel</span>
                </Link>
              </div>

              {profile.launchers.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl space-y-2">
                  <Server className="w-7 h-7 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">Aún no tienes ningún launcher creado.</p>
                  <Link
                    href="/dashboard"
                    className="inline-block mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition"
                  >
                    Ir al Panel a Crear Servidor
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.launchers.map((l: any) => (
                    <div
                      key={l.id}
                      className="bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl transition space-y-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-zinc-950 text-xs shadow-sm flex-shrink-0"
                            style={{ backgroundColor: l.primaryColor || '#ffffff' }}
                          >
                            {l.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">{l.name}</h4>
                            <p className="text-[11px] text-zinc-500 font-mono">/{l.slug}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-medium">
                            {l.mcVersion} {l.loader}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-800/80 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Mods</span>
                          <span className="font-semibold text-white">{l.mods.length}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Descargas</span>
                          <span className="font-semibold text-white">{l.downloadCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Noticias</span>
                          <span className="font-semibold text-white">{l.newsItems?.length || 0}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href={`/dashboard`}
                          className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded-lg text-xs font-medium transition text-center"
                        >
                          Gestionar en Panel
                        </Link>

                        <button
                          onClick={() => handleCopyDownloadLink(l.slug)}
                          title="Copiar link de descarga pública"
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition flex items-center gap-1"
                        >
                          {copiedSlug === l.slug ? <Check className="w-3.5 h-3.5 text-zinc-100" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSlug === l.slug ? 'Copiado' : 'Link'}</span>
                        </button>

                        <a
                          href={`/d/${l.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver página pública de descarga"
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: ACCOUNT */}
        {activeTab === 'account' && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6 max-w-xl">
            <div>
              <h3 className="text-sm font-semibold text-white">Datos de la Cuenta</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Actualiza tu nombre visible en la plataforma y consulta los detalles de acceso.
              </p>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Nombre actualizado correctamente.</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-zinc-900 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Nombre Completo o Nickname</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre o apodo"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Correo Electrónico</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800/60 rounded-lg text-xs text-zinc-500 cursor-not-allowed font-mono"
                />
                <p className="text-[11px] text-zinc-500">
                  El correo electrónico está vinculado a tus compras y licencias.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB CONTENT: SECURITY */}
        {activeTab === 'security' && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6 max-w-xl">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-zinc-400" /> Seguridad y Cambio de Contraseña
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Mantén protegida tu cuenta actualizando periódicamente tu clave de acceso.
              </p>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>¡Contraseña cambiada con éxito!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-zinc-900 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Contraseña Actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Introduce tu contraseña actual"
                  required
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  <span>Actualizar Contraseña</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB CONTENT: BILLING */}
        {activeTab === 'billing' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Plan Actual</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Plan {profile.plan}</h3>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-lg border ${
                    profile.plan === 'LIFETIME'
                      ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                      : profile.plan === 'PRO'
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {profile.plan === 'LIFETIME'
                    ? 'Licencia Vitalicia'
                    : profile.plan === 'PRO'
                    ? 'Suscripción Activa'
                    : 'Plan Gratuito'}
                </span>
              </div>

              {/* Feature comparison / active perks */}
              <div className="pt-4 border-t border-zinc-800 space-y-3 text-xs">
                <h4 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
                  Beneficios y Estado de la Cuenta
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                    <span>Límite de servidores: {isFree ? '1 Servidor' : 'Ilimitados'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                    <span>Publicidad: {isFree ? 'Con anuncios estándar' : '100% Sin anuncios (Ad-free)'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                    <span>Subida de mods .jar propios: {isFree ? 'Solo catálogo Modrinth' : 'Habilitado (En la Nube)'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                    <span>Tablón de noticias en launcher: {isFree ? 'No disponible' : 'Múltiples comunicados activos'}</span>
                  </div>
                </div>
              </div>

              {/* Alertas de cancelación */}
              {cancelSuccess && (
                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{cancelSuccess}</span>
                </div>
              )}

              {cancelError && (
                <div className="p-4 bg-zinc-900 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{cancelError}</span>
                </div>
              )}

              {/* Si es PRO: Gestión de Suscripción Mensual y Cancelación */}
              {profile.plan === 'PRO' && (
                <div className="pt-4 border-t border-zinc-800 space-y-4">
                  <div className="p-5 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          Ciclo de Facturación Mensual
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Tu suscripción PRO se renueva automáticamente cada mes por <strong>$4.99 USD</strong>.
                        </p>
                      </div>
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 whitespace-nowrap self-start sm:self-auto">
                        Renovación Activa
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 space-y-1">
                      <p className="flex items-center gap-1.5 text-zinc-300 font-medium">
                        <Shield className="w-3.5 h-3.5 text-zinc-400" />
                        Garantía Legal de Cancelación Autónoma:
                      </p>
                      <p>
                        Puedes cancelar la renovación en cualquier momento con 1 solo clic. No hay compromisos de permanencia ni cobros adicionales. Al cancelar, tu cuenta pasará automáticamente al plan gratuito sin penalizaciones.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-[11px] text-zinc-500">
                        ¿Deseas interrumpir la renovación del próximo mes?
                      </p>

                      <button
                        type="button"
                        onClick={() => setIsConfirmCancelOpen(true)}
                        className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 rounded-lg text-xs font-medium transition flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Cancelar Suscripción</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Si es LIFETIME: Pago único permanente */}
              {profile.plan === 'LIFETIME' && (
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <div className="p-5 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Licencia Vitalicia Fundador</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Tu cuenta está cubierta por un pago único vitalicio. No existen cuotas mensuales, cargos recurrentes ni renovaciones pendientes. Todas las características PRO están activas para siempre.
                    </p>
                  </div>
                </div>
              )}

              {/* Si es FREE: Invitación a mejorar */}
              {isFree && (
                <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
                  <div>
                    <h5 className="text-xs font-semibold text-white">¿Necesitas más capacidad?</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Pasa a Plan PRO por $4.99/mes o adquiere Lifetime ($49) sin mensualidades.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUpgradeOpen(true)}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0 shadow-sm"
                  >
                    Mejorar Ahora
                  </button>
                </div>
              )}

              {/* Transparencia y Cumplimiento Legal Stripe / E-commerce */}
              <div className="pt-4 border-t border-zinc-800 flex items-start gap-3 text-[11px] text-zinc-500">
                <CreditCard className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Cumplimiento de pagos legales y seguros:</strong> Procesamiento bajo estándar bancario cifrado PCI-DSS Level 1. Facturas con desglose de impuestos disponibles en cada ciclo. El usuario mantiene en todo momento el control total sobre sus métodos de pago y renovaciones.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de Cancelación Legal */}
      {isConfirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-sm font-semibold text-white">¿Confirmas la cancelación de tu suscripción?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tu suscripción mensual PRO se cancelará inmediatamente. No se te volverá a cobrar ninguna mensualidad.
              </p>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 space-y-1">
              <p className="text-zinc-300 font-medium">Al cancelar:</p>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                <li>Tu cuenta pasará al plan Gratuito (FREE).</li>
                <li>Se mantendrán guardados tus servidores existentes.</li>
                <li>Podrás volver a reactivar PRO en cualquier momento cuando lo desees.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={cancellingSub}
                onClick={() => setIsConfirmCancelOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-lg transition"
              >
                Mantener mi Plan PRO
              </button>

              <button
                type="button"
                disabled={cancellingSub}
                onClick={handleCancelSubscription}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-2 shadow-sm"
              >
                {cancellingSub ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelando...</span>
                  </>
                ) : (
                  <span>Sí, Cancelar Suscripción</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSuccess={() => {
          setIsUpgradeOpen(false);
          loadProfile();
        }}
        currentPlan={profile.plan}
      />
    </div>
  );
}
