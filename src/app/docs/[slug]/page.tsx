import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Calendar, ChevronRight, BookOpen } from 'lucide-react';
import { getPostBySlug, getAllPublishedPosts } from '@/lib/blog-service';
import { PublicNavbar } from '@/components/PublicNavbar';

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
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Header unificado */}
      <PublicNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-300 transition">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/docs" className="hover:text-zinc-300 transition">Recursos</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-400 truncate max-w-xs">{post.category}</span>
        </nav>

        {/* Article Header */}
        <div className="space-y-4 border-b border-zinc-800/80 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime}</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(post.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-100 tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Espacio reservado publicitario / AdSense banner */}
        <div className="p-3 bg-[#121215] border border-zinc-800 rounded-xl text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-medium">Publicidad</div>
          <div className="min-h-[90px] flex items-center justify-center text-xs text-zinc-500 font-mono">
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
        <article className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base text-zinc-300 leading-relaxed">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl sm:text-2xl font-bold text-zinc-100 pt-6 pb-2 tracking-tight border-b border-zinc-800/80">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('---')) {
              return <hr key={index} className="border-t border-zinc-800 my-6" />;
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={index} className="space-y-2 list-disc list-inside pl-2 text-zinc-300">
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
                <ol key={index} className="space-y-2.5 list-decimal list-inside pl-2 text-zinc-300">
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
                <pre key={index} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs overflow-x-auto">
                  <code>{cleanedCode}</code>
                </pre>
              );
            }
            return (
              <p key={index} className="text-zinc-300 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Publicidad Inferior */}
        <div className="p-3 bg-[#121215] border border-zinc-800 rounded-xl text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-medium">Publicidad Patrocinada</div>
          <div className="min-h-[90px] flex items-center justify-center text-xs text-zinc-500 font-mono">
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

        {/* Caja de Autoría y Verificación Técnica E-E-A-T */}
        <div className="bg-[#121215] border border-zinc-800 p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              EP
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-zinc-100">Equipo Técnico de ElysiumPad</h4>
                <span className="text-[10px] bg-zinc-900 text-emerald-400 border border-zinc-800 px-2 py-0.5 rounded font-semibold">
                  Especialistas en Infraestructura
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Artículo redactado y validado técnicamente por el equipo de ingeniería de ElysiumPad. Investigamos y probamos entornos JVM, cargadores Fabric/Forge y optimización de servidores para que tu comunidad funcione con máxima estabilidad.
              </p>
            </div>
          </div>
          <Link
            href="/about"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline whitespace-nowrap self-end sm:self-center"
          >
            Conocer al equipo →
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 border-t border-zinc-800/80 space-y-4">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Otros artículos recomendados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/docs/${related.slug}`}
                  className="p-5 bg-[#121215] border border-zinc-800 rounded-xl hover:border-zinc-700 transition flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      {related.category}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-300 transition line-clamp-2">
                      {related.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-4 block">
                    {related.readingTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#0e0e11] py-8 px-6 lg:px-12 text-xs text-zinc-500 text-center">
        <p>© {new Date().getFullYear()} ElysiumPad. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
