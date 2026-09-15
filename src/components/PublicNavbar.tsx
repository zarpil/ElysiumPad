'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X } from 'lucide-react';

export function PublicNavbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/docs', label: 'Guías' },
    { href: '/about', label: 'Sobre Nosotros' },
    { href: '/contact', label: 'Contacto' },
    { href: '/#precios', label: 'Planes' },
  ];

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#0e0e11] sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5 text-white group">
          <img
            src="/logo.png"
            alt="ElysiumPad"
            className="w-7 h-7 rounded-lg object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-zinc-100 leading-none">
              ElysiumPad
            </span>
            <span className="text-[10px] text-zinc-400 font-medium leading-none mt-1">
              Minecraft Launcher Studio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition ${
                  isActive ? 'text-emerald-400 font-semibold' : 'hover:text-zinc-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Action / Auth Buttons */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="hidden sm:flex items-center gap-2.5">
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition font-medium"
              >
                Admin
              </Link>
            )}
            <Link
              href="/profile"
              className="text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800 transition font-medium"
            >
              Mi Perfil
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-3.5 py-1.5 rounded-lg transition shadow-sm"
            >
              <span>Panel de Control</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-3.5 py-1.5 rounded-lg transition shadow-sm"
            >
              <span>Crear Launcher</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0e0e11] border-b border-zinc-800 p-6 flex flex-col gap-4 shadow-xl z-50">
          <nav className="flex flex-col gap-3 text-sm font-medium text-zinc-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1 transition ${
                  pathname === link.href ? 'text-emerald-400 font-semibold' : 'hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-2.5">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-zinc-100 text-zinc-950 font-semibold rounded-lg text-xs text-center"
                >
                  Panel de Control
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-xs text-center"
                >
                  Mi Perfil
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-xs text-center"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs text-center"
                >
                  Crear Launcher Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
