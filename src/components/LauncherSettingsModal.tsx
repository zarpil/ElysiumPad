'use client';

import React, { useState } from 'react';
import { Settings2, Save, Trash2, Loader2, Server, Check } from 'lucide-react';

interface LauncherSettingsProps {
  launcher: any;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function LauncherSettingsModal({
  launcher,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}: LauncherSettingsProps & { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState(launcher.name || '');
  const [description, setDescription] = useState(launcher.description || '');
  const [serverIp, setServerIp] = useState(launcher.serverIp || '');
  const [serverPort, setServerPort] = useState(launcher.serverPort || 25565);
  const [allowOffline, setAllowOffline] = useState(launcher.allowOffline ?? true);
  const [recommendedRamGb, setRecommendedRamGb] = useState(launcher.recommendedRamGb || 4);
  const [primaryColor, setPrimaryColor] = useState(launcher.primaryColor || '#10b981');
  const [windowTitle, setWindowTitle] = useState(launcher.windowTitle || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/launchers/${launcher.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          serverIp,
          serverPort: Number(serverPort),
          allowOffline,
          recommendedRamGb: Number(recommendedRamGb),
          primaryColor,
          windowTitle: windowTitle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al guardar cambios');
      }

      setSavedSuccess(true);
      onUpdated();
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el launcher "${launcher.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/launchers/${launcher.slug}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onDeleted();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-400" />
            Configuración del Servidor & Launcher
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Servidor</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">IP del Servidor</label>
              <input
                type="text"
                placeholder="mc.amigos.es"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Puerto</label>
              <input
                type="number"
                value={serverPort}
                onChange={(e) => setServerPort(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">RAM Recomendada (GB)</label>
              <input
                type="number"
                min={2}
                max={32}
                value={recommendedRamGb}
                onChange={(e) => setRecommendedRamGb(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Color Temático</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Permitir No-Premium */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Soporte Offline / No-Premium</p>
              <p className="text-[11px] text-slate-400">
                Permite a los jugadores jugar sin necesidad de cuenta oficial de Microsoft
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowOffline}
              onChange={(e) => setAllowOffline(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded bg-slate-900 border-slate-700 focus:ring-emerald-500"
            />
          </div>

          {/* Zona de peligro / Borrado */}
          <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-400">Zona de Peligro</p>
              <p className="text-[11px] text-slate-400">Eliminar este launcher y todos sus archivos asociados</p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : savedSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{savedSuccess ? 'Guardado' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
