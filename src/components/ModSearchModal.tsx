'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, Loader2, Download, Sparkles, AlertCircle, X, Layers, ChevronDown, ExternalLink } from 'lucide-react';

interface ModSearchProps {
  launcherSlug: string;
  mcVersion: string;
  loader: string;
  onModAdded: () => void;
  existingModrinthIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: '', label: 'Todos' },
  { id: 'optimization', label: '⚡ Optimización' },
  { id: 'utility', label: '🛠️ Utilidad' },
  { id: 'magic', label: '✨ Magia' },
  { id: 'technology', label: '⚙️ Tecnología' },
  { id: 'adventure', label: '🗺️ Aventura' },
  { id: 'decoration', label: '🪑 Decoración' },
];

export function ModSearchModal({
  launcherSlug,
  mcVersion,
  loader,
  onModAdded,
  existingModrinthIds,
  isOpen,
  onClose,
}: ModSearchProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estado para el modal de selección de versiones de un mod específico
  const [selectedProjectForVersions, setSelectedProjectForVersions] = useState<any | null>(null);
  const [projectVersions, setProjectVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleSearch(query, category);
    }
  }, [isOpen, category]);

  async function handleSearch(searchTerm = query, cat = category) {
    setLoading(true);
    setError(null);
    try {
      const q = searchTerm.trim();
      const res = await fetch(
        `/api/modrinth/search?q=${encodeURIComponent(q)}&version=${mcVersion}&loader=${loader}&limit=30`
      );
      const data = await res.json();
      if (data.success) {
        let hits = data.hits || [];
        if (cat) {
          hits = hits.filter((h: any) => h.categories?.includes(cat));
        }
        setResults(hits);
      } else {
        setError(data.error || 'Error al conectar con Modrinth');
      }
    } catch (err: any) {
      setError(err.message || 'Error de red con la API de Modrinth');
    } finally {
      setLoading(false);
    }
  }

  // Abrir lista de versiones para que el usuario escoja manualmente
  async function openVersionPicker(hit: any) {
    setSelectedProjectForVersions(hit);
    setLoadingVersions(true);
    try {
      const vRes = await fetch(
        `/api/modrinth/versions?id=${hit.project_id}&version=${mcVersion}&loader=${loader}`
      );
      const vData = await vRes.json();
      if (vData.success) {
        setProjectVersions(vData.versions || []);
      } else {
        setProjectVersions([]);
      }
    } catch (err) {
      console.error(err);
      setProjectVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  }

  // Instalar versión específica seleccionada
  async function handleInstallVersion(project: any, targetVersion: any) {
    setAddingId(targetVersion.id);
    setError(null);
    try {
      const primaryFile = targetVersion.files.find((f: any) => f.primary) || targetVersion.files[0];
      if (!primaryFile) {
        throw new Error('Archivo .jar no disponible para esta versión');
      }

      const saveRes = await fetch(`/api/launchers/${launcherSlug}/mods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modrinthId: project.project_id,
          versionId: targetVersion.id,
          title: project.title,
          fileName: primaryFile.filename,
          downloadUrl: primaryFile.url,
          fileSize: primaryFile.size,
          sha1: primaryFile.hashes?.sha1,
          sha512: primaryFile.hashes?.sha512,
          iconUrl: project.icon_url,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveData.success) {
        throw new Error(saveData.error || 'Error al guardar el mod');
      }

      onModAdded();
      setSelectedProjectForVersions(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingId(null);
    }
  }

  // Instalación rápida directa de la última versión
  async function handleQuickInstall(hit: any) {
    setAddingId(hit.project_id);
    setError(null);
    try {
      const vRes = await fetch(
        `/api/modrinth/versions?id=${hit.project_id}&version=${mcVersion}&loader=${loader}`
      );
      const vData = await vRes.json();

      if (!vData.success || !vData.versions || vData.versions.length === 0) {
        throw new Error(`No hay versión compatible para ${mcVersion} (${loader})`);
      }

      await handleInstallVersion(hit, vData.versions[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingId(null);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#141a29] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-[#111622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Explorador Oficial de Mods
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Modrinth CDN
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Filtrando automáticamente para <strong className="text-emerald-400">{mcVersion}</strong> ({loader})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="p-6 pb-4 border-b border-slate-800/60 bg-[#141a29] space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query, category);
            }}
            className="relative flex items-center"
          >
            <Search className="absolute left-4 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar mods (ej: Sodium, Iris, JEI, JourneyMap, Voice Chat)..."
              className="w-full pl-11 pr-28 py-3 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-inner"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
            </button>
          </form>

          {/* Categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-bold text-[11px] uppercase mr-1">Filtros:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition flex-shrink-0 ${
                  category === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Lista de Resultados */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && results.length === 0 && (
            <div className="text-center py-16 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
              <p className="text-xs text-slate-400">Consultando mods en Modrinth...</p>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-xs space-y-2">
              <p className="font-semibold text-white text-sm">No se encontraron mods compatibles</p>
              <p>Prueba con otro término de búsqueda o selecciona la categoría "Todos".</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((hit) => {
              const isAdded = existingModrinthIds.includes(hit.project_id);
              const isAdding = addingId === hit.project_id;

              return (
                <div
                  key={hit.project_id}
                  className="p-4 bg-[#111622] hover:bg-[#161d2d] border border-slate-800 hover:border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <a
                      href={`https://modrinth.com/mod/${hit.slug || hit.project_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex-shrink-0"
                      title="Ver información en Modrinth"
                    >
                      {hit.icon_url ? (
                        <img
                          src={hit.icon_url}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover border border-slate-800 group-hover:border-emerald-500 group-hover:scale-105 transition shadow-sm"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:border group-hover:border-emerald-500 group-hover:text-emerald-400 transition">
                          MC
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900/90 rounded border border-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition">
                        <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
                      </span>
                    </a>

                    <div className="min-w-0">
                      <a
                        href={`https://modrinth.com/mod/${hit.slug || hit.project_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-white text-xs truncate block hover:text-emerald-400 transition"
                        title="Abrir en Modrinth"
                      >
                        {hit.title}
                      </a>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{hit.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3 text-slate-400" />
                          {(hit.downloads / 1000).toFixed(0)}k
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[90px]">{hit.author}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isAdded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                        <Check className="w-3.5 h-3.5" /> Instalado
                      </span>
                    ) : (
                      <>
                        {/* Selector manual de versiones */}
                        <button
                          onClick={() => openVersionPicker(hit)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
                          title="Elegir versión específica"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón Instalación Rápida */}
                        <button
                          onClick={() => handleQuickInstall(hit)}
                          disabled={isAdding}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl transition shadow-md shadow-emerald-500/10 disabled:opacity-50"
                        >
                          {isAdding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Instalar
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL SECUNDARIO: SELECTOR DE VERSIONES DE MOD */}
        {selectedProjectForVersions && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#141a29] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Versiones de {selectedProjectForVersions.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Elige la compilación exacta para {mcVersion} ({loader})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProjectForVersions(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {loadingVersions ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                  <p className="text-xs text-slate-400">Obteniendo versiones disponibles...</p>
                </div>
              ) : projectVersions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No se encontraron versiones compatibles para {mcVersion}.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {projectVersions.map((v) => {
                    const isVersionAdding = addingId === v.id;
                    const primary = v.files?.find((f: any) => f.primary) || v.files?.[0];

                    return (
                      <div
                        key={v.id}
                        className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-2 hover:border-slate-700 transition text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{v.name || v.version_number}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {primary?.filename} • {(primary?.size / 1024).toFixed(0)} KB
                          </p>
                        </div>

                        <button
                          onClick={() => handleInstallVersion(selectedProjectForVersions, v)}
                          disabled={isVersionAdding}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition flex items-center gap-1 text-[11px] flex-shrink-0 disabled:opacity-50"
                        >
                          {isVersionAdding ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                          <span>Instalar</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForVersions(null)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
