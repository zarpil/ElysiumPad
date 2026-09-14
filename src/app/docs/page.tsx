import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, BookOpen, Clock, ArrowRight, Sparkles, Layers, Cpu, Server, Shield } from 'lucide-react';
import { getAllPublishedPosts } from '@/lib/blog-service';

export const metadata: Metadata = {
  title: 'Guías y Recursos sobre Servidores de Minecraft — ElysiumPad',
  description: 'Artículos, optimización de mods, gestión de memoria Java y tutoriales de configuración de clientes para comunidades de Minecraft.',
};

export default async function DocsPage() {
  const posts = await getAllPublishedPosts();

  const categories = ['Todos', 'Servidores', 'Mods', 'Rendimiento'];

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-300 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[#1b2333] bg-[#0f141f] sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-white group">
          <img
            src="/logo.png"
            alt="ElysiumPad"
            className="w-8 h-8 rounded-lg object-contain shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white leading-none group-hover:text-emerald-400 transition">
              ElysiumPad
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-none mt-1">
              Centro de Recursos
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" /> Artículos y Recursos Técnicos
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Guías, Rendimiento y Gestión de Servidores Minecraft
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Explora recomendaciones técnicas, comparativas de modloaders, metodologías de optimización y tutoriales de configuración para administradores y comunidades.
          </p>
        </div>

        {/* Featured / Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-[#121824] border border-[#1e2739] rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition group shadow-lg"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{post.readingTime}</span>
                  </div>
                </div>

                <Link href={`/docs/${post.slug}`}>
                  <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition tracking-tight leading-snug">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-[#1a2334] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Link
                  href={`/docs/${post.slug}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform"
                >
                  <span>Leer artículo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Banner AdSense Friendly / Soporte */}
        <div className="bg-gradient-to-br from-[#121824] to-[#151f2e] border border-[#1e2739] p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">
              ¿Administras una comunidad y buscas simplificar la entrada de jugadores?
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Crea tu cliente de juego preconfigurado con instalación de mods y Java sin fricción técnica.
            </p>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            Empezar Ahora
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b2333] bg-[#0b0e15] py-8 px-6 text-xs text-slate-500 text-center">
        <p>© {new Date().getFullYear()} ElysiumPad. Todos los derechos reservados. No afiliado con Mojang ni Microsoft.</p>
      </footer>
    </div>
  );
}
