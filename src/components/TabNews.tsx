'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Pin,
  Sparkles,
  Lock,
  ExternalLink,
  Image as ImageIcon,
  Tag,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Power,
  Upload,
  X,
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  tag: string;
  link: string | null;
  btnText: string | null;
  imageUrl: string | null;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
}

interface TabNewsProps {
  launcher: any;
  isFree: boolean;
  onUpdated: () => void;
  onUpgradeOpen?: () => void;
}

const TAG_CONFIG: Record<string, { label: string; color: string }> = {
  NOVEDAD: { label: 'Novedad', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  EVENTO: { label: 'Evento', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  ACTUALIZACIÓN: { label: 'Actualización', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  MANTENIMIENTO: { label: 'Mantenimiento', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  TIENDA: { label: 'Tienda / Rangos', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  SORTEO: { label: 'Sorteo', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
};

export function TabNews({ launcher, isFree, onUpdated, onUpgradeOpen }: TabNewsProps) {
  const [newsList, setNewsList] = useState<NewsItem[]>(launcher.newsItems || []);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form states for creating a new post
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('NOVEDAD');
  const [newLink, setNewLink] = useState('');
  const [newBtnText, setNewBtnText] = useState('Ver Más');
  const [newImage, setNewImage] = useState('');
  const [newPinned, setNewPinned] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida (PNG, JPG, WEBP)');
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'news');
      formData.append('slug', launcher.slug);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      setNewImage(data.url);
    } catch (err: any) {
      setError(err.message || 'Error al subir imagen');
    } finally {
      setIsUploadingImage(false);
    }
  }

  // Simulator index
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (launcher.newsItems) {
      setNewsList(launcher.newsItems);
    }
  }, [launcher.newsItems]);

  async function fetchNews() {
    try {
      const res = await fetch(`/api/launchers/${launcher.slug}/news?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && data.news) {
        setNewsList(data.news);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateNews(e: React.FormEvent) {
    e.preventDefault();
    if (isFree) return;
    if (!newTitle.trim() || !newContent.trim()) {
      setError('El título y el contenido son obligatorios');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/launchers/${launcher.slug}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          tag: newTag,
          link: newLink.trim() || null,
          btnText: newBtnText.trim() || 'Ver Más',
          imageUrl: newImage.trim() || null,
          isPinned: newPinned,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al crear la noticia');
      }

      // Reset form
      setNewTitle('');
      setNewContent('');
      setNewTag('NOVEDAD');
      setNewLink('');
      setNewBtnText('Ver Más');
      setNewImage('');
      setNewPinned(false);
      setIsCreating(false);

      await fetchNews();
      onUpdated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean) {
    try {
      await fetch(`/api/launchers/${launcher.slug}/news`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      await fetchNews();
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleTogglePin(id: string, currentPin: boolean) {
    try {
      await fetch(`/api/launchers/${launcher.slug}/news`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPinned: !currentPin }),
      });
      await fetchNews();
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConfirmDelete() {
    if (!newsToDelete) return;
    const targetId = newsToDelete.id;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/launchers/${launcher.slug}/news?newsId=${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al eliminar el comunicado');
      }

      // Actualización inmediata optimista
      setNewsList((prev) => prev.filter((n) => n.id !== targetId));
      setNewsToDelete(null);

      // Re-sincronizar y avisar al dashboard
      await fetchNews();
      onUpdated();
    } catch (err: any) {
      console.error('Error al eliminar comunicado:', err);
      setDeleteError(err.message || 'Error de conexión al eliminar');
    } finally {
      setIsDeleting(false);
    }
  }


  // Active news for launcher simulator
  const activeNews = newsList.filter((n) => n.isActive);
  const currentPreviewNews =
    activeNews.length > 0
      ? activeNews[Math.min(previewIndex, activeNews.length - 1)]
      : null;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#121824] border border-[#1e2739] rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Tablón de Noticias y Comunicados del Launcher</h3>
              {isFree ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  EXCLUSIVO PRO
                </span>
              ) : (
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {newsList.length} Comunicados
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestiona múltiples noticias, eventos, cambios y anuncios que tus jugadores podrán consultar directamente en el launcher.
            </p>
          </div>
        </div>

        {!isFree && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Cancelar' : 'Nuevo Comunicado'}</span>
          </button>
        )}
      </div>

      {/* Free Plan Lock Banner */}
      {isFree && (
        <div className="p-6 bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-emerald-500/10 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 text-left">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl flex-shrink-0 mt-1">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Publica múltiples noticias y eventos directamente en el launcher de tus jugadores
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                En el Plan Free el launcher muestra anuncios de patrocinadores. Con el <strong>Plan PRO</strong> eliminas toda publicidad externa y desbloqueas el <strong>tablón multi-noticias</strong>: anuncia reinicios de temporadas, torneos, sorteos y cambios de mods para que tus amigos no se pierdan nada al entrar al juego.
              </p>
            </div>
          </div>

          <button
            onClick={onUpgradeOpen}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Desbloquear con Plan PRO ($4.99)</span>
          </button>
        </div>
      )}

      {/* Creator Form (Visible when isCreating is true and !isFree) */}
      {isCreating && !isFree && (
        <form
          onSubmit={handleCreateNews}
          className="bg-[#121824] border border-emerald-500/40 rounded-2xl p-6 space-y-5 animate-fadeIn shadow-2xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2436]">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Crear Nuevo Comunicado / Noticia
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Rellena los datos para emitir un aviso en el carrusel de noticias del launcher.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cerrar
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Tag Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" /> Categoría del Comunicado
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {Object.entries(TAG_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNewTag(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center ${
                    newTag === key
                      ? `${config.color} font-bold shadow-sm ring-1 ring-emerald-500/40`
                      : 'bg-[#0f1420] border-[#1b2333] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Título del Comunicado
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ej: 🔥 Gran Torneo PvP este Sábado a las 18:00 UTC"
              className="w-full px-3.5 py-2.5 bg-[#0e131d] border border-[#1b2333] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Contenido / Mensaje Detallado
            </label>
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Ej: ¡Prepara tu clan! Habrá eventos de drop, llaves exclusivas y recompensas en el lobby para los 3 mejores equipos."
              className="w-full px-3.5 py-2.5 bg-[#0e131d] border border-[#1b2333] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
              required
            />
          </div>

          {/* Button text & destination URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Texto del Botón de Acción
              </label>
              <input
                type="text"
                value={newBtnText}
                onChange={(e) => setNewBtnText(e.target.value)}
                placeholder="Ej: Unirse al Discord / Ver Tienda"
                className="w-full px-3.5 py-2.5 bg-[#0e131d] border border-[#1b2333] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" /> Enlace de Destino (URL)
              </label>
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://discord.gg/tu-comunidad"
                className="w-full px-3.5 py-2.5 bg-[#0e131d] border border-[#1b2333] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
              />
            </div>
          </div>

          {/* Banner Image URL, File Uploader, Size Recommendation & Pin */}
          <div className="space-y-3 p-4 rounded-xl bg-[#0a0e17] border border-[#1b2333]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Imagen de Cabecera del Comunicado (Opcional)</span>
              </label>

              {/* Badge de recomendación de tamaño para el launcher */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-semibold text-emerald-400 shadow-sm">
                <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Recomendado para Launcher: <strong>640 × 360 px</strong> (Relación 16:9)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              La proporción <strong>16:9</strong> asegura que la imagen no sufra recortes forzados y se vea perfectamente nítida tanto en el carrusel principal como en el panel lateral de novedades del launcher.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
              <div className="md:col-span-8">
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... o pega una URL directa"
                  className="w-full px-3.5 py-2.5 bg-[#0e131d] border border-[#1b2333] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
                />
              </div>

              <div className="md:col-span-4 flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#141b29] hover:bg-[#1a2438] border border-[#223049] hover:border-emerald-500/40 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer">
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Subir Foto</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    disabled={isUploadingImage}
                    onChange={handleImageUpload}
                  />
                </label>

                {newImage && (
                  <button
                    type="button"
                    onClick={() => setNewImage('')}
                    title="Quitar imagen"
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Live Image Preview Thumbnail */}
            {newImage && (
              <div className="p-2.5 rounded-xl bg-[#070a10] border border-[#1a2334] flex items-center gap-3">
                <div className="w-24 h-14 rounded-lg overflow-hidden relative border border-white/10 bg-black/60 shrink-0">
                  <img
                    src={newImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-left space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">16:9 ENCUADRE LAUNCHER</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[200px] font-mono">{newImage}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Así se encuadrará en el launcher. El contenido se adapta de forma centrada (`object-cover`).
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2 border-t border-[#141c2a]">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPinned}
                  onChange={(e) => setNewPinned(e.target.checked)}
                  className="rounded bg-[#0e131d] border-[#1b2333] text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <Pin className="w-3.5 h-3.5 text-amber-400" />
                <span>Fijar como comunicado destacado al inicio</span>
              </label>
            </div>
          </div>


          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Publicar Noticia</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: News List on Left, Live Launcher Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List of Published News */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Comunicados Publicados ({newsList.length})
            </h4>
            <span className="text-[11px] text-slate-500">
              {activeNews.length} activos en el launcher
            </span>
          </div>

          {newsList.length === 0 ? (
            <div className="p-8 bg-[#121824] border border-[#1e2739] rounded-2xl text-center space-y-3">
              <Megaphone className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-medium text-white">No has publicado comunicados todavía</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Crea tu primera noticia para avisar a tus amigos de eventos, cambios en el modpack o reinicios de mapas.
              </p>
              {!isFree && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Publicar Primer Comunicado
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {newsList.map((item) => {
                const tagConfig = TAG_CONFIG[item.tag] || TAG_CONFIG.NOVEDAD;
                const isSelectedInPreview = currentPreviewNews?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      const idx = activeNews.findIndex((n) => n.id === item.id);
                      if (idx !== -1) setPreviewIndex(idx);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelectedInPreview
                        ? 'bg-[#141d2c] border-emerald-500/60 ring-1 ring-emerald-500/25 shadow-lg shadow-emerald-950/20'
                        : item.isActive
                        ? 'bg-[#121824] border-[#1e2739] hover:border-[#28354f]'
                        : 'bg-[#0f1420]/60 border-[#182030] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${tagConfig.color}`}
                        >
                          {tagConfig.label}
                        </span>

                        {item.isPinned && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Fijado
                          </span>
                        )}

                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>

                        {isSelectedInPreview && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" /> En Simulador
                          </span>
                        )}
                      </div>

                      {/* Action buttons: Toggle active, Toggle pin, Delete */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleTogglePin(item.id, item.isPinned)}
                          title={item.isPinned ? 'Desfijar' : 'Fijar al inicio'}
                          className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                            item.isPinned
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          title={item.isActive ? 'Desactivar del launcher' : 'Activar en el launcher'}
                          className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                            item.isActive
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setNewsToDelete(item);
                          }}
                          title="Eliminar comunicado"
                          className="p-1.5 rounded-lg border bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Foto de Cabecera en la Tarjeta del Panel */}
                    {item.imageUrl && (
                      <div className="mt-3 w-full h-36 sm:h-40 rounded-xl overflow-hidden relative border border-[#1e2739] bg-black/50 shadow-inner group">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 border border-white/10 text-[9px] font-mono text-slate-300 backdrop-blur-sm">
                          16:9
                        </div>
                      </div>
                    )}

                    <div className="mt-2.5 text-left">
                      <h5 className="text-xs font-bold text-white leading-snug">{item.title}</h5>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    </div>

                    {item.link && (
                      <div className="mt-2.5 pt-2 border-t border-[#182132] flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Botón: {item.btnText || 'Ver Más'}</span>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-mono truncate max-w-[200px]"
                        >
                          <span>{item.link}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          )}
        </div>

        {/* Right Column: Multi-News Desktop Launcher Simulator */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Simulador Multi-Noticias del Launcher
            </span>
            {activeNews.length > 1 && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <button
                  onClick={() => setPreviewIndex((prev) => (prev > 0 ? prev - 1 : activeNews.length - 1))}
                  className="p-1 rounded hover:bg-slate-800 text-slate-300 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>
                  {previewIndex + 1} / {activeNews.length}
                </span>
                <button
                  onClick={() => setPreviewIndex((prev) => (prev < activeNews.length - 1 ? prev + 1 : 0))}
                  className="p-1 rounded hover:bg-slate-800 text-slate-300 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Launcher Frame Mockup */}
          <div className="bg-[#0b0f17] border border-[#1e273a] rounded-2xl overflow-hidden shadow-2xl">
            {/* Window Title Bar */}
            <div className="h-7 bg-[#080b11] border-b border-[#182132] px-3 flex items-center justify-between text-[11px] text-slate-500 font-mono select-none">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold ml-2">
                  {launcher.windowTitle || launcher.name}
                </span>
              </div>
              <span className="text-[10px] opacity-60">1.20.1 Fabric</span>
            </div>

            {/* Launcher Body Content */}
            <div className="p-4 space-y-4">
              {/* Server mini header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#151c2a]">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs shadow-sm"
                    style={{ backgroundColor: launcher.primaryColor || '#10b981' }}
                  >
                    {launcher.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{launcher.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5">● Servidor En Línea</p>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded bg-[#131b29] border border-[#1e283c] text-[10px] text-slate-300 font-mono">
                  {launcher.mods?.length || 0} mods
                </div>
              </div>

              {/* In-Launcher News Feed / Carousel Component */}
              {currentPreviewNews ? (
                <div className="bg-[#121927] border border-[#223049] rounded-xl overflow-hidden shadow-lg transition-all animate-fadeIn">
                  {currentPreviewNews.imageUrl && (
                    <div className="w-full aspect-video max-h-40 overflow-hidden relative border-b border-[#1a2538] bg-black/40">
                      <img
                        src={currentPreviewNews.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121927] via-transparent to-transparent opacity-70 pointer-events-none" />
                    </div>

                  )}


                  <div className="p-3.5 space-y-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                            TAG_CONFIG[currentPreviewNews.tag]?.color || TAG_CONFIG.NOVEDAD.color
                          }`}
                        >
                          {TAG_CONFIG[currentPreviewNews.tag]?.label || currentPreviewNews.tag}
                        </span>
                        {currentPreviewNews.isPinned && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                            <Pin className="w-2.5 h-2.5" /> Fijado
                          </span>
                        )}
                      </div>

                      {activeNews.length > 1 && (
                        <div className="flex items-center gap-1">
                          {activeNews.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setPreviewIndex(idx)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                idx === previewIndex ? 'w-4 bg-emerald-400' : 'bg-slate-700 hover:bg-slate-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        {currentPreviewNews.title}
                      </h5>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed line-clamp-3">
                        {currentPreviewNews.content}
                      </p>
                    </div>

                    {currentPreviewNews.link && (
                      <div className="pt-1">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 shadow-sm transition"
                          style={{ backgroundColor: launcher.primaryColor || '#10b981' }}
                        >
                          <span>{currentPreviewNews.btnText || 'Ver Más'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Fallback State */
                <div className="p-6 border border-dashed border-[#1d273a] rounded-xl text-center space-y-2">
                  <Megaphone className="w-6 h-6 text-slate-600 mx-auto" />
                  <p className="text-xs font-medium text-slate-400">
                    No hay ningún comunicado activo en este momento.
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Crea una noticia o activa una existente para que aparezca en el carrusel del launcher.
                  </p>
                </div>
              )}

              {/* Launcher Play Bar */}
              <div className="pt-2 flex items-center justify-between gap-3 bg-[#0d131f] p-3 rounded-xl border border-[#192336]">
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Perfil activo</p>
                  <p className="text-xs font-bold text-white">Jugador123</p>
                </div>

                <div
                  className="px-6 py-2 rounded-lg font-black text-xs text-slate-950 shadow-sm flex items-center gap-1.5"
                  style={{ backgroundColor: launcher.primaryColor || '#10b981' }}
                >
                  <span>JUGAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación para Eliminar Comunicado */}

      {newsToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#101520] border border-[#1e2739] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-black/80 relative">
            {/* Header con icono de alerta */}
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">¿Eliminar este comunicado?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estás a punto de eliminar permanentemente:
                  <span className="text-white font-semibold block mt-1.5 p-2 bg-[#0c1018] rounded-lg border border-[#1a2232] text-[11px] truncate">
                    «{newsToDelete.title}»
                  </span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Esta acción no se puede deshacer. El comunicado desaparecerá de inmediato del panel web y del launcher de todos tus jugadores.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1a2232]">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setNewsToDelete(null);
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl transition flex items-center gap-2 shadow-lg shadow-rose-950/40 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, eliminar comunicado</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

