import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Download, Server, Cpu, Check, Layers, ExternalLink } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const launcher = await prisma.launcherConfig.findUnique({
    where: { slug },
    include: {
      mods: { select: { id: true } },
      user: { select: { plan: true } },
    },
  });

  if (!launcher) {
    return {
      title: 'Launcher no encontrado — ElysiumPad',
    };
  }

  const isFree = launcher.user.plan === 'FREE';
  const title = (!isFree && launcher.windowTitle)
    ? launcher.windowTitle
    : `${launcher.name} — Launcher Oficial Minecraft`;

  const description = (!isFree && launcher.description)
    ? launcher.description
    : `Descarga el launcher oficial de ${launcher.name} para Minecraft ${launcher.mcVersion} (${launcher.loader}). ${launcher.mods.length} mods instalados y sincronizados en tiempo real.`;

  const imageUrl = (!isFree && launcher.bannerUrl)
    ? launcher.bannerUrl
    : (!isFree && launcher.logoUrl)
    ? launcher.logoUrl
    : 'https://elysiumpad.com/icon.png';

  return {
    title,
    description,
    themeColor: launcher.primaryColor || '#10b981',
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'ElysiumPad',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${launcher.name} Launcher`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function DownloadLauncherPage({ params }: PageProps) {
  const { slug } = await params;

  const [launcher, globalSettings] = await Promise.all([
    prisma.launcherConfig.findUnique({
      where: { slug },
      include: {
        mods: true,
        customAssets: true,
        newsItems: {
          where: { isActive: true },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: 3,
        },
        user: {
          select: { plan: true },
        },
      },
    }),
    prisma.globalSettings.findFirst(),
  ]);

  if (!launcher) {
    notFound();
  }

  const isFree = launcher.user.plan === 'FREE';
  const adsEnabled = isFree && (globalSettings?.adsEnabled ?? true) && (globalSettings?.adsWebDownload ?? true);

  // Opciones de personalización PRO
  const heroTitle = (!isFree && launcher.windowTitle) ? launcher.windowTitle : launcher.name;
  const heroDescription = (!isFree && launcher.description)
    ? launcher.description
    : 'Descarga el launcher oficial preconfigurado. No necesitas instalar Java manualmente ni configurar mods por separado: se sincronizan y actualizan solos.';
  const hasCustomBanner = !isFree && Boolean(launcher.bannerUrl);

  return (
    <div
      className="min-h-screen bg-[#0c1017] text-slate-200 flex flex-col items-center justify-between font-sans selection:bg-emerald-500 selection:text-slate-950 relative"
      style={
        hasCustomBanner
          ? {
              backgroundImage: `linear-gradient(to bottom, rgba(12, 16, 23, 0.85), rgba(12, 16, 23, 0.98)), url(${launcher.bannerUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      {/* Header */}
      <header className="w-full max-w-4xl py-6 px-6 flex items-center justify-between border-b border-[#1a2333]/60">
        <div className="flex items-center gap-3">
          {!isFree && launcher.logoUrl ? (
            <img
              src={launcher.logoUrl}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-[#1e2739]"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-slate-950 text-base shadow-sm"
              style={{ backgroundColor: launcher.primaryColor || '#10b981' }}
            >
              {launcher.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-tight">{launcher.name}</h1>
            <p className="text-xs text-slate-400">Launcher Oficial del Servidor</p>
          </div>
        </div>

        {launcher.serverIp && (
          <div className="flex items-center gap-2 bg-[#121824] border border-[#1d2638] px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{launcher.serverIp}</span>
          </div>
        )}
      </header>

      {/* Main Download Card */}
      <main className="w-full max-w-3xl px-6 py-10 flex-1 flex flex-col justify-center">
        {/* Server News / Multi-Announcements Feed (PRO) */}
        {!isFree && launcher.newsItems && launcher.newsItems.length > 0 ? (
          <div className="space-y-3 mb-6">
            {launcher.newsItems.map((item) => (
              <div key={item.id} className="bg-[#121927] border border-[#223049] rounded-xl p-5 text-left shadow-lg">
                {item.imageUrl && (
                  <div className="w-full h-32 rounded-lg overflow-hidden mb-3 border border-[#1d273a]">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {item.tag || 'NOVEDAD'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.content}</p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition"
                  >
                    <span>{item.btnText || 'Ver Más'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : !isFree && launcher.broadcastEnabled && launcher.broadcastTitle ? (
          <div className="bg-[#121927] border border-[#223049] rounded-xl p-5 mb-6 text-left shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {launcher.broadcastTag || 'COMUNICADO OFICIAL'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Novedades del Servidor</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{launcher.broadcastTitle}</h3>
            {launcher.broadcastMessage && (
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{launcher.broadcastMessage}</p>
            )}
            {launcher.broadcastLink && (
              <a
                href={launcher.broadcastLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition"
              >
                <span>{launcher.broadcastBtnText || 'Ver Más'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : null}

        <div className="bg-[#121824] border border-[#1e2739] rounded-xl p-8 md:p-10 shadow-xl text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#161f30] border border-[#222f47] text-slate-300 text-xs font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cliente Preconfigurado y Listo para Jugar</span>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              {heroTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              {heroDescription}
            </p>
          </div>

          {/* Download Buttons */}
          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <a
                href={`/api/launchers/${launcher.slug}/download?os=windows`}
                style={{ backgroundColor: launcher.primaryColor || '#10b981' }}
                className="w-full sm:w-auto px-7 py-3 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2.5 hover:opacity-95"
              >
                <Download className="w-4 h-4" />
                <span>Descargar para Windows (.exe)</span>
              </a>

              <a
                href={`/api/launchers/${launcher.slug}/download?os=linux`}
                className="w-full sm:w-auto px-5 py-3 bg-[#182132] hover:bg-[#1f2b40] text-slate-200 font-semibold text-xs rounded-lg border border-[#222d42] transition flex items-center justify-center gap-2"
                title="Descargar para Linux o Mac"
              >
                <span>Linux / Mac (.sh)</span>
              </a>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Descargas totales: <strong className="text-slate-300 font-mono">{launcher.downloadCount}</strong></span>
              <span>•</span>
              <a
                href={`/api/launchers/${launcher.slug}/download?os=manifest`}
                className="hover:text-emerald-400 underline transition"
              >
                Descargar configuración (JSON)
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Compatible con Windows 10 y 11 • {launcher.allowOffline ? 'Admite cuentas oficiales de Microsoft y modo offline' : 'Solo cuentas oficiales de Microsoft'}
          </p>

          {/* Especificaciones del Servidor */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#1a2333] text-left">
            <div className="bg-[#0f1420] p-3 rounded-lg border border-[#1a2333]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Minecraft</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{launcher.mcVersion}</span>
            </div>

            <div className="bg-[#0f1420] p-3 rounded-lg border border-[#1a2333]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Modloader</span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{launcher.loader}</span>
            </div>

            <div className="bg-[#0f1420] p-3 rounded-lg border border-[#1a2333]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Mods Sincronizados</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{launcher.mods.length} mods</span>
            </div>

            <div className="bg-[#0f1420] p-3 rounded-lg border border-[#1a2333]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">RAM Asignada</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{launcher.recommendedRamGb} GB</span>
            </div>
          </div>

          {/* Lista de mods previsualizados */}
          {launcher.mods.length > 0 && (
            <div className="pt-2 text-left space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Mods incluidos en el paquete:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {launcher.mods.map((m) => (
                  <a
                    key={m.id}
                    href={m.modrinthId ? `https://modrinth.com/mod/${m.modrinthId}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] bg-[#0f1420] border border-[#1b2333] hover:border-emerald-500/50 text-slate-300 hover:text-white px-2.5 py-1 rounded-md transition"
                  >
                    {m.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ad Banner for FREE tier */}
        {adsEnabled && (
          <>
            <AdBanner
              variant="download"
              upgradeUrl="/#planes"
              className="mt-6 shadow-lg"
              adData={{
                enabled: true,
                provider: globalSettings?.adProvider,
                bannerImg: globalSettings?.adBannerImg,
                link: globalSettings?.adProvider === 'ADMAVEN' && globalSettings?.adMavenPopunderUrl
                  ? globalSettings.adMavenPopunderUrl
                  : globalSettings?.adBannerLink,
                text: globalSettings?.adBannerText,
                bannerHtml: globalSettings?.adProvider === 'ADMAVEN'
                  ? globalSettings?.adMavenBannerHtml
                  : (globalSettings?.adProvider === 'SCRIPT' ? globalSettings?.adCustomScript : null),
              }}
            />
            {globalSettings?.adProvider === 'ADMAVEN' && globalSettings?.adMavenTagScript && (
              <div dangerouslySetInnerHTML={{ __html: globalSettings.adMavenTagScript }} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl py-6 px-6 text-center text-xs text-slate-500 border-t border-[#1a2333]/60">
        {isFree ? (
          <p>
            Generado con el gestor de launchers de <strong className="text-slate-400">ElysiumPad</strong>
          </p>
        ) : (
          <p>© {new Date().getFullYear()} {launcher.name}. Todos los derechos reservados.</p>
        )}
      </footer>
    </div>
  );
}
