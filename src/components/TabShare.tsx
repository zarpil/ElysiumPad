import React, { useState, useRef } from 'react';
import {
  Share2,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Lock,
  Palette,
  Image as ImageIcon,
  MessageSquare,
  Save,
  Loader2,
  Crown,
  Upload,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

import { copyToClipboard } from '@/lib/clipboard';

interface TabShareProps {
  launcher: any;
  isFree: boolean;
  onUpdated: () => void;
  onUpgradeOpen?: () => void;
}

export function TabShare({ launcher, isFree, onUpdated, onUpgradeOpen }: TabShareProps) {
  const [copied, setCopied] = useState(false);

  // Estados de personalización de la página pública
  const [description, setDescription] = useState(launcher.description || '');
  const [bannerUrl, setBannerUrl] = useState(launcher.bannerUrl || '');
  const [logoUrl, setLogoUrl] = useState(launcher.logoUrl || '');
  const [customTitle, setCustomTitle] = useState(launcher.windowTitle || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de subida directa de archivos
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File, type: 'banner' | 'logo') {
    if (!file) return;
    if (type === 'banner') setUploadingBanner(true);
    if (type === 'logo') setUploadingLogo(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('slug', launcher.slug);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      if (type === 'banner') {
        setBannerUrl(data.url);
      } else {
        setLogoUrl(data.url);
      }
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      if (type === 'banner') setUploadingBanner(false);
      if (type === 'logo') setUploadingLogo(false);
    }
  }

  async function handleCopy() {
    const url = `${window.location.origin}/d/${launcher.slug}`;
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleSaveCustomization(e: React.FormEvent) {
    e.preventDefault();
    if (isFree) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/launchers/${launcher.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim() || null,
          bannerUrl: bannerUrl.trim() || null,
          logoUrl: logoUrl.trim() || null,
          windowTitle: customTitle.trim() || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al guardar personalización');
      }

      setSaveSuccess(true);
      onUpdated();
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Caja de Enlace Rápido */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-8 space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <Share2 className="w-7 h-7" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-black text-white">Enlace de Descarga para Amigos</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pasa este enlace a tus amigos. Verán la página de tu servidor con el botón de descarga directa de tu launcher.
          </p>
        </div>

        <div className="max-w-lg mx-auto flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-2xl">
          <input
            type="text"
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/d/${launcher.slug}`}
            className="flex-1 bg-transparent px-3 text-xs text-slate-300 font-mono focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        {/* Banner de Slug Personalizado para usuarios FREE */}
        {isFree ? (
          <div className="max-w-lg mx-auto p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5 text-xs text-amber-200">
              <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>¿Quieres un Slug limpio como <strong>/d/mi-servidor</strong>?</span>
            </div>
            {onUpgradeOpen && (
              <button
                type="button"
                onClick={onUpgradeOpen}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-[11px] whitespace-nowrap transition flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                Desbloquear con PRO
              </button>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] text-emerald-400 font-semibold">
            <Crown className="w-3 h-3 text-emerald-400" />
            Slug URL Personalizado Activo
          </div>
        )}

        <div className="pt-2 flex items-center justify-center gap-4">
          <Link
            href={`/d/${launcher.slug}`}
            target="_blank"
            className="text-xs text-indigo-400 hover:underline flex items-center gap-1.5 font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver Página en Vivo
          </Link>
          <a
            href={`/api/v1/launchers/${launcher.slug}/manifest`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:underline flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver Manifiesto JSON
          </a>
        </div>
      </div>

      {/* ESTUDIO DE PERSONALIZACIÓN DE LA PÁGINA (EXCLUSIVO PRO) */}
      <div className="bg-[#141a29] border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              Personalización de la Landing Pública
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                PRO
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Personaliza el banner de fondo, logo, título y mensaje de bienvenida que ven tus amigos al descargar.
            </p>
          </div>

          <Link
            href={`/d/${launcher.slug}`}
            target="_blank"
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 w-fit font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" /> Previsualizar
          </Link>
        </div>

        {isFree ? (
          /* TARJETA DE UPSELL A PRO */
          <div className="p-8 bg-slate-950/60 border border-amber-500/20 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="font-extrabold text-white text-base">
                Desbloquea el White-Label & Personalización Total
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                En el plan gratuito, la página de descarga usa el diseño estándar y muestra la marca *"Powered by ElysiumPad"*. Con PRO puedes poner tus propias imágenes, logo de tu comunidad y eliminar todas las marcas de agua.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-300 py-1">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Banner de fondo personalizado
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Logo de tu servidor
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> 100% White-label (sin publicidad)
              </span>
            </div>

            <button
              onClick={() => onUpgradeOpen && onUpgradeOpen()}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg text-xs transition inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Mejorar a Plan PRO ($4.99/mes)</span>
            </button>
          </div>
        ) : (
          /* FORMULARIO DE PERSONALIZACIÓN PARA USUARIOS PRO */
          <form onSubmit={handleSaveCustomization} className="space-y-5 text-xs">
            {uploadError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Banner de Fondo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-300">
                    Banner de Fondo (1920x1080)
                  </label>
                  {bannerUrl && (
                    <button
                      type="button"
                      onClick={() => setBannerUrl('')}
                      className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px] transition"
                    >
                      <Trash2 className="w-3 h-3" /> Quitar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://... o sube una imagen"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'banner');
                    }}
                  />

                  <button
                    type="button"
                    disabled={uploadingBanner}
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer disabled:opacity-50"
                    title="Subir archivo desde tu ordenador"
                  >
                    {uploadingBanner ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{uploadingBanner ? 'Subiendo...' : 'Subir'}</span>
                  </button>
                </div>

                {bannerUrl && (
                  <div className="relative h-20 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80">
                    <img src={bannerUrl} alt="Vista previa banner" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Logo del Servidor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-300">
                    Logo del Servidor (Cuadrado 512x512)
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px] transition"
                    >
                      <Trash2 className="w-3 h-3" /> Quitar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://... o sube una imagen"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logo');
                    }}
                  />

                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer disabled:opacity-50"
                    title="Subir logo desde tu ordenador"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{uploadingLogo ? 'Subiendo...' : 'Subir'}</span>
                  </button>
                </div>

                {logoUrl && (
                  <div className="flex items-center gap-3 p-2 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <img src={logoUrl} alt="Vista previa logo" className="w-12 h-12 rounded-lg object-contain border border-slate-700" />
                    <div className="text-[11px] text-slate-400 truncate">
                      <span className="text-white font-medium block">Logo cargado correctamente</span>
                      <span className="font-mono text-[10px] text-slate-500 truncate block">{logoUrl}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Título del Hero / Encabezado
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={`Únete a ${launcher.name}`}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Mensaje de Bienvenida / Descripción para tus Amigos
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¡Bienvenidos al servidor! Descargad el launcher pulsando el botón de abajo y entraréis directo con todos los mods listos..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                Los cambios se verán reflejados al instante en la landing de tus amigos.
              </span>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-500/10"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saveSuccess ? 'Guardado con Éxito' : 'Guardar Diseño'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
