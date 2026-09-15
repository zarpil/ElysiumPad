import React from 'react';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#0e0e11] py-8 px-6 lg:px-12 text-xs text-zinc-500">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ElysiumPad" className="w-6 h-6 rounded object-contain" />
          <span className="font-semibold text-zinc-300">ElysiumPad</span>
          <span className="text-zinc-600">•</span>
          <span>Gestor de launchers para Minecraft</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-zinc-400">
          <Link href="/about" className="hover:text-zinc-200 transition">Sobre Nosotros</Link>
          <Link href="/docs" className="hover:text-zinc-200 transition">Guías</Link>
          <Link href="/dashboard" className="hover:text-zinc-200 transition">Panel</Link>
          <Link href="/contact" className="hover:text-zinc-200 transition">Contacto</Link>
          <Link href="/terms" className="hover:text-zinc-200 transition">Términos</Link>
          <Link href="/privacy" className="hover:text-zinc-200 transition">Privacidad</Link>
        </div>

        <p className="text-[11px] text-zinc-600">
          © {new Date().getFullYear()} ElysiumPad. No afiliado con Mojang ni Microsoft.
        </p>
      </div>
    </footer>
  );
}
