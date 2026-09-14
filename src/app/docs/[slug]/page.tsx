import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Share2, Tag, ChevronRight, BookOpen, Layers, Sparkles } from 'lucide-react';
import { getPostBySlug, getAllPublishedPosts } from '@/lib/blog-service';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Artículo no encontrado — ElysiumPad',
    };
  }

  return {
    title: `${post.title} — ElysiumPad`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      url: `https://elysiumpad.com/docs/${post.slug}`,
      siteName: 'ElysiumPad',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllPublishedPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

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
              Recursos y Guías
            </span>
          </div>
        </Link>

        <Link
          href="/docs"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ver todos los artículos</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/docs" className="hover:text-slate-300 transition">Recursos</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-400 truncate max-w-xs">{post.category}</span>
        </nav>

        {/* Article Header */}
        <div className="space-y-4 border-b border-[#1b2333] pb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(post.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Espacio reservado publicitario / AdSense banner */}
        <div className="p-3 bg-[#0f1420] border border-[#1b2538] rounded-xl text-center">
          <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-medium">Publicidad</div>
          <div className="min-h-[90px] flex items-center justify-center text-xs text-slate-500 font-mono">
            {/* Contenedor adaptativo de anuncios AdSense */}
            <ins
              className="adsbygoogle block w-full text-center"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-7488531171409193"
              data-ad-slot="default"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>

        {/* Content Body */}
        <article className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl sm:text-2xl font-bold text-white pt-6 pb-2 tracking-tight border-b border-[#1b2333]/80">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('---')) {
              return <hr key={index} className="border-t border-[#1b2333] my-6" />;
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={index} className="space-y-2 list-disc list-inside pl-2 text-slate-300">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">
                      {item.replace(/^- /, '')}
                    </li>
                  ))}
                </ul>
              );
            }
            if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ')) {
              const items = paragraph.split('\n');
              return (
                <ol key={index} className="space-y-2.5 list-decimal list-inside pl-2 text-slate-300">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">
                      {item.replace(/^\d+\.\s/, '')}
                    </li>
                  ))}
                </ol>
              );
            }
            if (paragraph.startsWith('```')) {
              const cleanedCode = paragraph.replace(/```[a-z]*\n?/g, '');
              return (
                <pre key={index} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
                  <code>{cleanedCode}</code>
                </pre>
              );
            }
            return (
              <p key={index} className="text-slate-300 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Publicidad Inferior */}
        <div className="p-3 bg-[#0f1420] border border-[#1b2538] rounded-xl text-center">
          <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-medium">Publicidad Patrocinada</div>
          <div className="min-h-[90px] flex items-center justify-center text-xs text-slate-500 font-mono">
            <ins
              className="adsbygoogle block w-full text-center"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-7488531171409193"
              data-ad-slot="default"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="pt-10 border-t border-[#1b2333] space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Otros artículos recomendados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/docs/${related.slug}`}
                  className="p-5 bg-[#121824] border border-[#1e2739] rounded-xl hover:border-slate-700 transition flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      {related.category}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-2">
                      {related.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-4 block">
                    {related.readingTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b2333] bg-[#0b0e15] py-8 px-6 text-xs text-slate-500 text-center">
        <p>© {new Date().getFullYear()} ElysiumPad. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
