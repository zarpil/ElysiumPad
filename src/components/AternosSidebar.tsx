import React from 'react';
import { Server, Sliders, Layers, FolderArchive, Share2, Plus, ShieldAlert, LogOut, Sparkles, Megaphone, User } from 'lucide-react';
import Link from 'next/link';

export type ActiveTab = 'server' | 'options' | 'mods' | 'files' | 'news' | 'share';

interface SidebarProps {
  launchers: any[];
  selectedSlug: string | null;
  activeTab: ActiveTab;
  currentUser: any;
  userPlan: string;
  onSelectLauncher: (launcher: any) => void;
  onTabChange: (tab: ActiveTab) => void;
  onCreateOpen: () => void;
  onLogout: () => void;
  onUpgradeOpen?: () => void;
}

export function AternosSidebar({
  launchers,
  selectedSlug,
  activeTab,
  currentUser,
  userPlan,
  onSelectLauncher,
  onTabChange,
  onCreateOpen,
  onLogout,
  onUpgradeOpen,
}: SidebarProps) {
  const current = launchers.find((l) => l.slug === selectedSlug);

  return (
    <aside className="w-64 bg-[#111622] border-r border-slate-800/80 flex flex-col justify-between flex-shrink-0">
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-emerald-500/20">
            EP
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">ElysiumPad</span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">
              Launcher Manager
            </span>
          </div>
        </div>

        <div className="p-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Mis Servidores</span>
            <button
              onClick={onCreateOpen}
              className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded hover:bg-slate-800 transition"
              title="Crear Servidor"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {launchers.map((l) => (
              <button
                key={l.id}
                onClick={() => onSelectLauncher(l)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  l.slug === selectedSlug
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className="truncate">{l.name}</span>
                <span className="text-[10px] font-mono opacity-60 flex-shrink-0">{l.mcVersion}</span>
              </button>
            ))}
          </div>
        </div>

        {current && (
          <nav className="p-3 space-y-1">
            <button
              onClick={() => onTabChange('server')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'server'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Servidor</span>
            </button>

            <button
              onClick={() => onTabChange('options')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'options'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Opciones</span>
            </button>

            <button
              onClick={() => onTabChange('mods')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'mods'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Mods</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {current.mods.length}
              </span>
            </button>

            <button
              onClick={() => onTabChange('files')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'files'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderArchive className="w-4 h-4 text-amber-400" />
                <span>Archivos & Configs</span>
              </div>
              {userPlan === 'FREE' && (
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">
                  PRO
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('news')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'news'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-4 h-4 text-cyan-400" />
                <span>Noticias & Anuncios</span>
              </div>
              {userPlan === 'FREE' && (
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">
                  PRO
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('share')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'share'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-4 h-4 text-rose-400" />
              <span>Compartir Launcher</span>
            </button>
          </nav>
        )}
      </div>

      <div className="p-4 border-t border-slate-800/60 space-y-2.5">
        {userPlan === 'FREE' && onUpgradeOpen && (
          <button
            onClick={onUpgradeOpen}
            className="w-full p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-xl text-left hover:border-emerald-500/60 transition group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Plan FREE
              </span>
              <span className="text-[9px] font-black text-slate-950 bg-emerald-400 px-1.5 py-0.5 rounded shadow-sm">
                MEJORAR
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
              Desbloquea subida de .jar propios y marca blanca.
            </p>
          </button>
        )}

        {currentUser?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="w-full flex items-center justify-between px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-300 transition"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              SuperAdmin
            </span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded font-mono">CRM</span>
          </Link>
        )}

        {/* Mi Perfil y Cuenta */}
        <Link
          href="/profile"
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition group"
        >
          <span className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Mi Perfil</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Ajustes →</span>
        </Link>

        <div className="flex items-center justify-between px-2 pt-1 text-xs">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 min-w-0 max-w-[150px] hover:text-white transition"
            title="Ver mi perfil"
          >
            <span className="text-slate-400 truncate font-medium hover:underline">
              {currentUser?.email || 'Usuario'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (onUpgradeOpen) onUpgradeOpen();
              }}
              className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition cursor-pointer flex-shrink-0"
              title="Ver o mejorar plan"
            >
              {userPlan} ⚡
            </button>
          </Link>
          <button onClick={onLogout} className="text-slate-500 hover:text-rose-400 p-1" title="Cerrar sesión">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
