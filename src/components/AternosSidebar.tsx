import React from 'react';
import { Server, Sliders, Layers, FolderArchive, Share2, Plus, ShieldAlert, LogOut, Megaphone, User } from 'lucide-react';
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
    <aside className="w-64 bg-[#0e0e11] border-r border-zinc-800/80 flex flex-col justify-between flex-shrink-0 select-none">
      <div>
        {/* Header / Brand */}
        <div className="p-4 flex items-center gap-2.5 border-b border-zinc-800/80">
          <img
            src="/logo.png"
            alt="ElysiumPad"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <div>
            <span className="font-bold text-sm tracking-tight text-zinc-100 block leading-tight">ElysiumPad</span>
            <span className="text-[11px] text-zinc-400 block leading-tight">
              Gestor de Servidores
            </span>
          </div>
        </div>

        {/* Lista de Servidores */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/20">
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-zinc-400">
            <span>Tus Servidores</span>
            <button
              onClick={onCreateOpen}
              className="text-zinc-400 hover:text-zinc-100 p-1 rounded-md hover:bg-zinc-800 transition"
              title="Crear Servidor"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {launchers.map((l) => {
              const isSelected = l.slug === selectedSlug;
              return (
                <button
                  key={l.id}
                  onClick={() => onSelectLauncher(l)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate">{l.name}</span>
                  <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0 ml-2">{l.mcVersion}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pestañas de Navegación del Servidor Seleccionado */}
        {current && (
          <nav className="p-3 space-y-1">
            <button
              onClick={() => onTabChange('server')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'server'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <Server className="w-4 h-4 text-zinc-400" />
              <span>Servidor</span>
            </button>

            <button
              onClick={() => onTabChange('options')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'options'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-4 h-4 text-zinc-400" />
              <span>Opciones</span>
            </button>

            <button
              onClick={() => onTabChange('mods')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'mods'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-zinc-400" />
                <span>Mods</span>
              </div>
              <span className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                {current.mods.length}
              </span>
            </button>

            <button
              onClick={() => onTabChange('files')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'files'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderArchive className="w-4 h-4 text-zinc-400" />
                <span>Archivos & Configs</span>
              </div>
              {userPlan === 'FREE' && (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-medium">
                  PRO
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('news')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'news'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 text-zinc-400" />
                <span>Noticias</span>
              </div>
              {userPlan === 'FREE' && (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-medium">
                  PRO
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('share')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'share'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <Share2 className="w-4 h-4 text-zinc-400" />
              <span>Compartir Launcher</span>
            </button>
          </nav>
        )}
      </div>

      {/* Pie del Sidebar */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2">
        {userPlan === 'FREE' && onUpgradeOpen && (
          <button
            onClick={onUpgradeOpen}
            className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg text-left transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">Plan Free</span>
              <span className="text-[10px] font-semibold text-emerald-400 hover:underline">
                Mejorar
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
              Desbloquea subida de archivos propios y marca blanca.
            </p>
          </button>
        )}

        {currentUser?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
              SuperAdmin
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">CRM</span>
          </Link>
        )}

        {/* Mi Perfil */}
        <Link
          href="/profile"
          className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition"
        >
          <span className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Mi Perfil</span>
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">Ajustes</span>
        </Link>

        {/* Usuario y Logout */}
        <div className="flex items-center justify-between px-2 pt-1 text-xs">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 min-w-0 max-w-[150px] hover:text-white transition"
            title="Ver mi perfil"
          >
            <span className="text-zinc-400 truncate font-medium hover:underline">
              {currentUser?.email || 'Usuario'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-zinc-800 text-zinc-300 flex-shrink-0">
              {userPlan}
            </span>
          </Link>
          <button onClick={onLogout} className="text-zinc-400 hover:text-red-400 p-1 transition" title="Cerrar sesión">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
