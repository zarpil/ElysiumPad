'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, RefreshCw, ArrowLeft, Activity, Radio } from 'lucide-react';

interface AdminHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  maintenanceMode?: boolean;
}

export function AdminHeader({ loading, onRefresh, maintenanceMode }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3 md:gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-white group">
          <img
            src="/logo.png"
            alt="ElysiumPad"
            className="w-8 h-8 rounded-lg object-contain shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform"
          />
          <span className="font-bold text-sm tracking-tight text-white group-hover:text-emerald-400 transition">
            ElysiumPad
          </span>
        </Link>

        <span className="text-slate-700 hidden sm:inline">/</span>

        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            SuperAdmin Control Center
          </span>
        </div>

        {maintenanceMode && (
          <span className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
            <Radio className="w-3 h-3 text-rose-400" /> MODO MANTENIMIENTO ACTIVO
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 border border-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Panel de Usuario</span>
        </Link>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>
    </header>
  );
}
