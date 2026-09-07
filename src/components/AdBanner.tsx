'use client';

import React from 'react';
import { ExternalLink, Sparkles, Server } from 'lucide-react';

interface AdBannerProps {
  onUpgrade?: () => void;
  upgradeUrl?: string;
  adData?: {
    enabled?: boolean;
    bannerImg?: string | null;
    link?: string | null;
    text?: string | null;
  } | null;
  className?: string;
  variant?: 'panel' | 'download';
}

export function AdBanner({ onUpgrade, upgradeUrl, adData, className = '', variant = 'panel' }: AdBannerProps) {
  const bannerLink = adData?.link || 'https://elysiumpad.com/pricing';
  const bannerText = adData?.text || 'Alojamiento de servidores de Minecraft de alto rendimiento • Servidores NVMe y Protección DDoS';
  const bannerImg = adData?.bannerImg;

  return (
    <div className={`bg-[#0f1420] border border-[#1d273a] rounded-xl overflow-hidden ${className}`}>
      {/* Top micro-bar: Ad label & Remove Ads CTA */}
      <div className="h-6 px-3 bg-[#0a0e17] border-b border-[#182030] flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span className="uppercase tracking-wider">Publicidad</span>
        {onUpgrade ? (
          <button
            onClick={onUpgrade}
            className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer transition font-semibold"
          >
            <Sparkles className="w-3 h-3" />
            <span>Eliminar anuncios con PRO</span>
          </button>
        ) : upgradeUrl ? (
          <a
            href={upgradeUrl}
            className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer transition font-semibold"
          >
            <Sparkles className="w-3 h-3" />
            <span>Eliminar anuncios con PRO</span>
          </a>
        ) : null}
      </div>

      {/* Ad content / sponsor display */}
      {bannerImg ? (
        <a
          href={bannerLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block group relative overflow-hidden"
        >
          <img
            src={bannerImg}
            alt="Anuncio patrocinado"
            className="w-full h-24 sm:h-28 object-cover group-hover:opacity-95 transition"
          />
        </a>
      ) : (
        <a
          href={bannerLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 hover:bg-[#121927] transition group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#182236] border border-[#243350] flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                ApexHosting & FalixNodes — Servidores de Minecraft con NVMe y Ryzen 9
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {bannerText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex-shrink-0 transition">
            <span>Visitar Sponsor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>
      )}
    </div>
  );
}
