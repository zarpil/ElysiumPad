'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  BookOpen,
  Tag,
  Clock,
  Save,
} from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
  readingTime: string;
  views: number;
  createdAt: string;
}

export function AdminTabBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Servidores');
  const [readingTime, setReadingTime] = useState('5 min');
  const [content, setContent] = useState('');

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          category,
          readingTime,
          content,
          published: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Artículo publicado con éxito.' });
        setTitle('');
        setSlug('');
        setExcerpt('');
        setContent('');
        setCreating(false);
        fetchPosts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar el artículo.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este artículo?')) return;

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" /> Gestor de Recursos y Artículos (SEO / Blog)
          </div>
          <h2 className="text-xl font-black text-white">Publicaciones y Guías de Servidores</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Crea nuevos artículos optimizados para atraer tráfico orgánico desde Google, enriquecer la web para AdSense y ganar visitas interesadas en Minecraft.
          </p>
        </div>

        <button
          onClick={() => setCreating(!creating)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{creating ? 'Cancelar' : 'Nuevo Artículo'}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Formulario de Creación */}
      {creating && (
        <form
          onSubmit={handleCreatePost}
          className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Redactar Nueva Publicación
            </h3>
            <span className="text-[11px] text-slate-500">Se publica sin firma personal (identidad de plataforma)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Título del Artículo</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Cómo configurar Sodium y Shaders en Fabric"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Slug URL (Opcional, se autogenera)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej: como-configurar-sodium-shaders"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Servidores">Servidores</option>
                <option value="Mods">Mods</option>
                <option value="Rendimiento">Rendimiento</option>
                <option value="Tutoriales">Tutoriales</option>
                <option value="Minecraft">Minecraft</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tiempo de lectura estimado</label>
              <input
                type="text"
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                placeholder="Ej: 5 min de lectura"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Resumen breve (Meta Description)</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Breve resumen de 1-2 frases para los resultados de búsqueda de Google y tarjetas sociales."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Contenido Completo (Markdown soportado)</label>
            <textarea
              rows={10}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el artículo aquí. Puedes usar subtítulos con '### Título', listas con '- elemento' o bloques de código con triple tilde invertida."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar y Publicar</span>
            </button>
          </div>
        </form>
      )}

      {/* Tabla / Lista de Posts */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>Artículos Disponibles ({posts.length})</span>
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:underline"
          >
            <span>Ver sección pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Cargando publicaciones...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No hay artículos todavía. Haz clic en "Nuevo Artículo" para añadir el primero.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">/docs/{post.slug}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{post.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{post.excerpt}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <a
                    href={`/docs/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Previsualizar artículo"
                  >
                    <Eye className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
