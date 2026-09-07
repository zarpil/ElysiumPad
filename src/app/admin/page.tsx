'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Users,
  Layers,
  Shield,
  Settings,
  ShieldAlert,
  BarChart3,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabAnalytics } from '@/components/admin/AdminTabAnalytics';
import { AdminTabUsers } from '@/components/admin/AdminTabUsers';
import { AdminTabLaunchers } from '@/components/admin/AdminTabLaunchers';
import { AdminTabAudit } from '@/components/admin/AdminTabAudit';
import { AdminTabSettings } from '@/components/admin/AdminTabSettings';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'launchers' | 'audit' | 'settings'>('analytics');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [launchers, setLaunchers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAllAdminData() {
    setLoading(true);
    try {
      const [statsRes, usersRes, launchersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/launchers'),
        fetch('/api/admin/settings'),
      ]);

      if (statsRes.status === 401) {
        router.push('/login?redirect=/admin');
        return;
      }

      if (statsRes.status === 403) {
        router.push('/dashboard');
        return;
      }

      const [statsData, usersData, launchersData, settingsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        launchersRes.json(),
        settingsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (usersData.success) setUsers(usersData.users);
      if (launchersData.success) setLaunchers(launchersData.launchers);
      if (settingsData.success) setSettings(settingsData.settings);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const navItems = [
    {
      id: 'analytics',
      label: 'Métricas & Finanzas',
      icon: BarChart3,
      badge: stats ? `$${stats.financials.mrr.toFixed(0)} MRR` : undefined,
    },
    {
      id: 'users',
      label: 'Directorio CRM',
      icon: Users,
      badge: users ? `${users.length}` : undefined,
    },
    {
      id: 'launchers',
      label: 'Auditoría de Launchers',
      icon: Layers,
      badge: launchers ? `${launchers.length}` : undefined,
    },
    {
      id: 'audit',
      label: 'Seguridad & Logs',
      icon: ShieldAlert,
    },
    {
      id: 'settings',
      label: 'Ajustes Globales',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <AdminHeader
        loading={loading}
        onRefresh={fetchAllAdminData}
        maintenanceMode={settings?.maintenanceMode}
      />

      {/* Main Container */}
      <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'analytics' && (
          <AdminTabAnalytics
            stats={stats}
            settings={settings}
            onNavigateTab={(tab: string) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === 'users' && (
          <AdminTabUsers
            users={users}
            loading={loading}
            onRefresh={fetchAllAdminData}
          />
        )}

        {activeTab === 'launchers' && (
          <AdminTabLaunchers
            launchers={launchers}
            loading={loading}
            onRefresh={fetchAllAdminData}
          />
        )}

        {activeTab === 'audit' && (
          <AdminTabAudit />
        )}

        {activeTab === 'settings' && (
          <AdminTabSettings
            initialSettings={settings}
            onRefresh={fetchAllAdminData}
          />
        )}
      </div>
    </div>
  );
}
