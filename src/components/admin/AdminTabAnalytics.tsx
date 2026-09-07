'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Layers,
  ArrowUpRight,
  Download,
  Zap,
  Percent,
  Cpu,
  Server,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface AnalyticsProps {
  stats: any;
  settings: any;
  onNavigateTab: (tab: string) => void;
}

export function AdminTabAnalytics({ stats, settings, onNavigateTab }: AnalyticsProps) {
  if (!stats) return null;

  const { users, financials, launchers, breakdowns } = stats;

  return (
    <div className="space-y-8">
      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>MRR Recurrente</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3 tracking-tight">
            ${financials.mrr.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1">/mes</span>
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> ARR: ${financials.arr.toFixed(2)}/año
            </span>
            <span className="text-slate-500 font-mono">{users.pro} suscriptores</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Ingresos LTV Totales</span>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3 tracking-tight">
            ${financials.totalRevenue.toFixed(2)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-indigo-400 font-medium">
              ${users.lifetime * 49} en ventas Lifetime
            </span>
            <span className="text-slate-500 font-mono">{users.lifetime} licencias</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Usuarios Registrados</span>
            <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3 tracking-tight">
            {users.total}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {users.active} activos • {users.suspended} susp.
            </span>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-teal-400 hover:underline flex items-center gap-0.5"
            >
              Ver CRM <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Launchers & Activity */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Launchers Creados</span>
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3 tracking-tight">
            {launchers.total}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-purple-300 font-medium">
              {launchers.totalMods} mods sincronizados
            </span>
            <button
              onClick={() => onNavigateTab('launchers')}
              className="text-purple-400 hover:underline flex items-center gap-0.5"
            >
              Auditoría <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Conversion & ARPU + Loaders Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion & Financial Health */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" /> Conversión y Eficiencia
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              {financials.conversionRate.toFixed(1)}% Pagos
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Tasa de Conversión (Free → Pro/Lifetime)</span>
                <span className="text-white font-mono font-semibold">{financials.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, financials.conversionRate)}%` }}
                />
                <div
                  className="bg-slate-700 h-full"
                  style={{ width: `${100 - Math.min(100, financials.conversionRate)}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">ARPU (Medio)</p>
                <p className="text-lg font-black text-white mt-0.5">${financials.arpu.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">Ingreso prom. por usuario</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Plan Free Ratio</p>
                <p className="text-lg font-black text-slate-300 mt-0.5">
                  {users.total > 0 ? ((users.free / users.total) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-[10px] text-slate-400">{users.free} usuarios no pagos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por Loader */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> Distribución de Modloaders
            </h3>
            <span className="text-xs text-slate-500 font-mono">{launchers.total} total</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Fabric', count: breakdowns.loaders.fabric, color: 'bg-cyan-500' },
              { name: 'Forge', count: breakdowns.loaders.forge, color: 'bg-amber-500' },
              { name: 'NeoForge', count: breakdowns.loaders.neoforge, color: 'bg-orange-500' },
              { name: 'Quilt', count: breakdowns.loaders.quilt, color: 'bg-purple-500' },
            ].map((loader) => {
              const pct = launchers.total > 0 ? (loader.count / launchers.total) * 100 : 0;
              return (
                <div key={loader.name}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="font-medium text-slate-300">{loader.name}</span>
                    <span className="font-mono text-slate-400">
                      {loader.count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${loader.color} h-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tráfico & Métricas del Cliente */}
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Actividad de Jugadores
            </h3>
            <span className="text-xs text-emerald-400 font-medium">En directo</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Descargas de Launchers</p>
                  <p className="text-[11px] text-slate-400">Desde páginas públicas /d/:slug</p>
                </div>
              </div>
              <p className="text-base font-black text-white font-mono">{launchers.totalDownloads}</p>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Sincronizaciones de Clientes</p>
                  <p className="text-[11px] text-slate-400">Peticiones de manifiesto launcher</p>
                </div>
              </div>
              <p className="text-base font-black text-white font-mono">{launchers.totalSyncs}</p>
            </div>

            {/* Quick Status */}
            <div className="p-3 bg-slate-950/40 border border-slate-800/50 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-400">Modo Mantenimiento:</span>
              <span className={`font-semibold ${settings?.maintenanceMode ? 'text-rose-400' : 'text-emerald-400'}`}>
                {settings?.maintenanceMode ? 'ACTIVADO' : 'Desactivado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
