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
  NOVEDAD: { label: 'Novedad', color: 'text-cyan-300 bg-cyan-950/50 border-cyan-800/60' },
  EVENTO: { label: 'Evento', color: 'text-emerald-300 bg-emerald-950/50 border-emerald-800/60' },
  ACTUALIZACIÓN: { label: 'Actualización', color: 'text-purple-300 bg-purple-950/50 border-purple-800/60' },
  MANTENIMIENTO: { label: 'Mantenimiento', color: 'text-amber-300 bg-amber-950/50 border-amber-800/60' },
  TIENDA: { label: 'Tienda / Rangos', color: 'text-pink-300 bg-pink-950/50 border-pink-800/60' },
  SORTEO: { label: 'Sorteo', color: 'text-yellow-300 bg-yellow-950/50 border-yellow-800/60' },
};

export function TabNews({ launcher, isFree, onUpdated, onUpgradeOpen }: TabNewsProps) {
  const [newsList, setNewsList] = useState<NewsItem[]>(launcher.newsItems || []);
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
      setError('El título y contenido son obligatorios');
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

      setNewsList((prev) => prev.filter((n) => n.id !== targetId));
      setNewsToDelete(null);

      await fetchNews();
      onUpdated();
    } catch (err: any) {
      console.error('Error al eliminar comunicado:', err);
      setDeleteError(err.message || 'Error de conexión al eliminar');
    } finally {
      setIsDeleting(false);
    }
  }

  const activeNews = newsList.filter((n) => n.isActive);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Tablón de Noticias del Launcher</h3>
              {isFree ? (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/60">
                  Plan PRO
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {newsList.length} Comunicados
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Publica anuncios, actualizaciones y novedades que tus jugadores verán directamente al abrir el launcher.
            </p>
          </div>
        </div>

        {!isFree && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreating ? 'Cancelar' : 'Nuevo Comunicado'}</span>
          </button>
        )}
      </div>

      {/* Free Plan Lock Banner */}
      {isFree && (
        <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 text-left">
            <div className="p-2.5 bg-zinc-800 text-zinc-400 rounded-lg flex-shrink-0 mt-1">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">
                Publica noticias y eventos en el launcher de tus jugadores
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                En el Plan Free el launcher incluye anuncios de patrocinadores. Con el <strong>Plan PRO</strong> eliminas toda publicidad externa y desbloqueas el <strong>tablón de noticias</strong> para anunciar reinicios, eventos y cambios de mods.
              </p>
            </div>
          </div>

          <button
            onClick={onUpgradeOpen}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition flex items-center gap-2 flex-shrink-0 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mejorar a Plan PRO ($4.99)</span>
          </button>
        </div>
      )}

      {/* Creator Form */}
      {isCreating && !isFree && (
        <form
          onSubmit={handleCreateNews}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-zinc-400" /> Crear Nuevo Comunicado
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Rellena los datos para publicar un aviso en el carrusel de novedades del launcher.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cerrar
            </button>
          </div>

          {error && (
            <div className="p-3 bg-zinc-950 border border-red-800/60 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Tag Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" /> Categoría del Comunicado
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {Object.entries(TAG_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNewTag(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition text-center cursor-pointer ${
                    newTag === key
                      ? `${config.color} border-current shadow-sm`
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Título del Comunicado
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ej: Gran Torneo PvP este Sábado a las 18:00 UTC"
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Contenido / Mensaje Detallado
            </label>
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Ej: Habrá eventos de drop, llaves exclusivas y recompensas en el lobby para los mejores equipos."
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition resize-none leading-relaxed"
              required
            />
          </div>

          {/* Button text & destination URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Texto del Botón de Acción
              </label>
              <input
                type="text"
                value={newBtnText}
                onChange={(e) => setNewBtnText(e.target.value)}
                placeholder="Ej: Unirse al Discord / Ver Tienda"
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-400" /> Enlace de Destino (URL)
              </label>
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://discord.gg/tu-servidor"
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition font-mono"
              />
            </div>
          </div>

          {/* Banner Image URL, File Uploader & Pin */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Imagen de Cabecera (Opcional - Proporción 16:9 recomendada)</span>
              </label>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 font-mono">
                <span>640 × 360 px</span>
              </div>
            </div>

            {/* Inputs: URL o Subida local */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="https://ejemplo.com/banner.png o sube un archivo"
                className="flex-1 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition font-mono"
              />

              <label className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Imagen</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>

              {newImage && (
                <button
                  type="button"
                  onClick={() => setNewImage('')}
                  className="px-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition"
                  title="Quitar imagen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Preview de la imagen */}
            {newImage && (
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <div className="w-24 h-14 rounded overflow-hidden relative border border-zinc-700 bg-black shrink-0">
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
                    <span className="text-[10px] font-semibold text-zinc-300 font-mono">16:9 VISTA PREVIA</span>
                    <span className="text-[10px] text-zinc-500 truncate max-w-[220px] font-mono">{newImage}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    La imagen se mostrará adaptada en la cabecera del comunicado dentro del launcher.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2 border-t border-zinc-800">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPinned}
                  onChange={(e) => setNewPinned(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-zinc-600 cursor-pointer"
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
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Publicar Noticia</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Published News */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Comunicados Publicados ({newsList.length})
          </h4>
          <span className="text-[11px] text-zinc-500">
            {activeNews.length} activos en el launcher
          </span>
        </div>

        {newsList.length === 0 ? (
          <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-xl text-center space-y-3">
            <Megaphone className="w-7 h-7 text-zinc-600 mx-auto" />
            <p className="text-xs font-semibold text-white">No has publicado comunicados todavía</p>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Crea tu primera noticia para avisar a tus jugadores de eventos, cambios en el modpack o novedades del servidor.
            </p>
            {!isFree && (
              <button
                onClick={() => setIsCreating(true)}
                className="mt-2 px-3.5 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                Publicar Primer Comunicado
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {newsList.map((item) => {
              const tagConfig = TAG_CONFIG[item.tag] || TAG_CONFIG.NOVEDAD;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl border transition ${
                    item.isActive
                      ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                      : 'bg-zinc-950 border-zinc-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wider ${tagConfig.color}`}
                      >
                        {tagConfig.label}
                      </span>

                      {item.isPinned && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5" /> Fijado
                        </span>
                      )}

                      <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions: Pin, Active toggle, Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePin(item.id, item.isPinned)}
                        title={item.isPinned ? 'Desfijar' : 'Fijar al inicio'}
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                          item.isPinned
                            ? 'bg-amber-950/50 border-amber-800/60 text-amber-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(item.id, item.isActive)}
                        title={item.isActive ? 'Desactivar del launcher' : 'Activar en el launcher'}
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                          item.isActive
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
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
                        className="p-1.5 rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-800/60 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Header Image */}
                  {item.imageUrl && (
                    <div className="mt-3.5 w-full h-44 sm:h-48 rounded-lg overflow-hidden relative border border-zinc-800 bg-black/40">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="mt-3 text-left">
                    <h5 className="text-sm font-semibold text-white leading-snug">{item.title}</h5>
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  {item.link && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Botón: {item.btnText || 'Ver Más'}</span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-300 hover:text-white flex items-center gap-1 font-mono truncate max-w-[260px] underline"
                      >
                        <span>{item.link}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmación para Eliminar Comunicado */}
      {newsToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">¿Eliminar este comunicado?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Estás a punto de eliminar permanentemente:
                  <span className="text-zinc-200 font-medium block mt-1 p-2 bg-zinc-950 rounded border border-zinc-800 text-[11px] truncate">
                    «{newsToDelete.title}»
                  </span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Esta acción no se puede deshacer. El comunicado desaparecerá de inmediato del panel web y del launcher de todos tus jugadores.
            </p>

            {deleteError && (
              <div className="p-3 bg-zinc-950 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setNewsToDelete(null);
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-xs font-medium text-white rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
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
