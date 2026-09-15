import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { getAllPublishedPosts } from '@/lib/blog-service';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Guías y Recursos sobre Servidores de Minecraft — ElysiumPad',
  description: 'Artículos, optimización de mods, gestión de memoria Java y tutoriales de configuración de clientes para comunidades de Minecraft.',
};

export default async function DocsPage() {
  const posts = await getAllPublishedPosts();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Header unificado */}
      <PublicNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Artículos y Recursos Técnicos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-100 tracking-tight leading-tight">
            Guías, Rendimiento y Gestión de Servidores Minecraft
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Explora recomendaciones técnicas, comparativas de modloaders, metodologías de optimización y tutoriales de configuración para administradores y comunidades.
          </p>
        </div>

        {/* Featured / Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-[#121215] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700 transition group shadow-sm"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{post.readingTime}</span>
                  </div>
                </div>

                <Link href={`/docs/${post.slug}`}>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition tracking-tight leading-snug">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  {new Date(post.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Link
                  href={`/docs/${post.slug}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
                >
                  <span>Leer artículo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Banner AdSense Friendly / Soporte */}
        <div className="bg-[#121215] border border-zinc-800 p-8 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-base font-bold text-zinc-100">
              ¿Administras una comunidad y buscas simplificar la entrada de jugadores?
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Crea tu cliente de juego preconfigurado con instalación de mods y Java sin fricción técnica.
            </p>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            Empezar Ahora
          </Link>
        </div>
      </main>

      {/* Footer unificado */}
      <PublicFooter />
    </div>
  );
}
