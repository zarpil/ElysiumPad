'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Server,
  Package,
  Globe,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  const faqs = [
    {
      q: '¿Mis jugadores necesitan instalar Java o el modloader por su cuenta?',
      a: 'No. El launcher detecta la versión exacta de Minecraft (1.20.1, 26.2, etc.) y su cargador (Fabric, Forge, NeoForge, Quilt) y gestiona los componentes necesarios automáticamente en el equipo del jugador.',
    },
    {
      q: '¿Qué ocurre cuando añado o elimino un mod en el panel?',
      a: 'El launcher comprueba el manifiesto del servidor al iniciarse. Si detecta que añadiste un mod nuevo o eliminaste uno antiguo, descargará o borrará los archivos necesarios antes de conectar a la partida.',
    },
    {
      q: '¿Es compatible con jugadores No-Premium (cuentas offline)?',
      a: 'Sí. Desde las opciones del servidor puedes permitir tanto cuentas oficiales de Microsoft como acceso mediante cuentas offline personalizadas.',
    },
    {
      q: '¿Puedo conectar un servidor alojado en Aternos, VPS o hostings dedicados?',
      a: 'Sí. Puedes vincular cualquier dirección IP y puerto de Minecraft. ElysiumPad no sustituye tu servidor de juego; gestiona el cliente y la distribución de mods para tus jugadores.',
    },
    {
      q: '¿Qué diferencia hay entre el Plan Free y los planes de pago?',
      a: 'El Plan Free permite crear 1 launcher activo y sincronizar mods directamente desde Modrinth, financiado mediante anuncios discretos. Los planes PRO y Lifetime son 100% libres de publicidad, admiten launchers ilimitados, subida de archivos .jar propios y personalización completa de marca.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 flex flex-col font-sans">
      {/* Header / Navbar */}
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

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#como-funciona" className="hover:text-zinc-100 transition">
              Cómo funciona
            </a>
            <a href="#caracteristicas" className="hover:text-zinc-100 transition">
              Características
            </a>
            <a href="#comparativa" className="hover:text-zinc-100 transition">
              Comparativa
            </a>
            <a href="#precios" className="hover:text-zinc-100 transition">
              Planes
            </a>
            <a href="#faq" className="hover:text-zinc-100 transition">
              Preguntas frecuentes
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
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
            <div className="flex items-center gap-2.5">
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
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-20 pb-20 px-6 lg:px-12 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Gestor y creador de launchers de Minecraft</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-100 tracking-tight max-w-3xl mx-auto leading-tight">
            Launchers personalizados para tu comunidad de Minecraft.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Configura tu servidor, sincroniza mods directamente desde Modrinth y entrega a tus jugadores un ejecutable que se actualiza solo. Sin descargas manuales de ZIPs ni tutoriales de carpetas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Comenzar gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="#vista-previa"
              className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs rounded-lg border border-zinc-800 transition flex items-center justify-center gap-2"
            >
              <span>Ver demostración</span>
            </a>
          </div>

          {/* Características rápidas */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-300" />
              <span>Fabric, Forge, NeoForge y Quilt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-300" />
              <span>Sincronizador diferencial SHA-1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-zinc-300" />
              <span>Modo online y offline</span>
            </div>
          </div>

          {/* VISTA PREVIA DEL PANEL */}
          <div id="vista-previa" className="pt-10 text-left">
            <div className="bg-[#121215] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="h-10 bg-[#0e0e11] border-b border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-200 font-semibold">ElysiumPad</span>
                  <span className="text-zinc-600">/</span>
                  <span>Survival Comunidad</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-zinc-300">mc.comunidad.es:25565</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Online (18ms)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 bg-[#121215]">
                {/* Sidebar Mockup */}
                <div className="p-4 border-r border-zinc-800 bg-[#0e0e11] space-y-4 hidden md:block">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Servidor
                    </span>
                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <p className="text-xs font-semibold text-zinc-100 truncate">Survival Comunidad</p>
                      <p className="text-[10px] font-mono text-zinc-400">1.20.1 Fabric</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="px-2.5 py-1.5 bg-zinc-800 rounded-md text-white font-medium flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Servidor</span>
                    </div>
                    <div className="px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200 rounded-md flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Opciones</span>
                    </div>
                    <div className="px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Mods</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 bg-zinc-800 rounded text-zinc-300">4</span>
                    </div>
                    <div className="px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200 rounded-md flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Compartir</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Mockup */}
                <div className="md:col-span-3 p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <span className="text-[11px] text-zinc-400 block">Versión</span>
                      <span className="text-base font-bold text-zinc-100">1.20.1</span>
                    </div>
                    <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <span className="text-[11px] text-zinc-400 block">Mods</span>
                      <span className="text-base font-bold text-zinc-100">4 activos</span>
                    </div>
                    <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <span className="text-[11px] text-zinc-400 block">Acceso</span>
                      <span className="text-base font-bold text-zinc-100">Premium & Offline</span>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
                    <p className="text-xs font-semibold text-zinc-200">Mods preconfigurados para tus jugadores</p>
                    <div className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                      <div className="flex items-center justify-between p-2 bg-zinc-950/60 rounded border border-zinc-800/80">
                        <span>Sodium (Optimización gráfica)</span>
                        <span className="text-emerald-400 text-[10px]">Sincronizado</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-zinc-950/60 rounded border border-zinc-800/80">
                        <span>Iris Shaders</span>
                        <span className="text-emerald-400 text-[10px]">Sincronizado</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-zinc-950/60 rounded border border-zinc-800/80">
                        <span>Xaero's Minimap</span>
                        <span className="text-emerald-400 text-[10px]">Sincronizado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como-funciona" className="py-16 border-t border-zinc-800/80 px-6 lg:px-12 bg-[#0e0e11]">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Flujo de trabajo
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                Cómo funciona ElysiumPad
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-[#121215] border border-zinc-800 rounded-xl space-y-2.5">
                <span className="w-7 h-7 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center font-semibold text-xs">
                  1
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">Configura tu servidor</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Indica la versión de Minecraft, el cargador de mods y la dirección IP de tu servidor.
                </p>
              </div>

              <div className="p-5 bg-[#121215] border border-zinc-800 rounded-xl space-y-2.5">
                <span className="w-7 h-7 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center font-semibold text-xs">
                  2
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">Añade mods con un clic</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Busca directamente en Modrinth. Los hashes SHA-1 y versiones compatibles se calculan solos.
                </p>
              </div>

              <div className="p-5 bg-[#121215] border border-zinc-800 rounded-xl space-y-2.5">
                <span className="w-7 h-7 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center font-semibold text-xs">
                  3
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">Tus jugadores juegan</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Compartes el enlace. Ellos descargan el launcher, se descargan los mods automáticamente y juegan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARATIVA */}
        <section id="comparativa" className="py-16 border-t border-zinc-800/80 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Comparativa
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                Método tradicional vs ElysiumPad
              </h2>
            </div>

            <div className="bg-[#121215] border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e0e11] border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Funcionalidad</th>
                    <th className="px-6 py-3.5 text-zinc-500">Distribución Manual (Drive / Mediafire)</th>
                    <th className="px-6 py-3.5 text-zinc-200">Con ElysiumPad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-zinc-200">Actualización de mods</td>
                    <td className="px-6 py-3.5 text-zinc-500">Reenviar un archivo ZIP completo</td>
                    <td className="px-6 py-3.5 text-zinc-200 font-medium">Sincronización diferencial automática</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-zinc-200">Gestión de Java</td>
                    <td className="px-6 py-3.5 text-zinc-500">Cada jugador debe instalar el JRE correcto</td>
                    <td className="px-6 py-3.5 text-zinc-200 font-medium">Descarga e inicio portable transparente</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-zinc-200">Conexión al servidor</td>
                    <td className="px-6 py-3.5 text-zinc-500">Copiar IP y puerto en la lista multijugador</td>
                    <td className="px-6 py-3.5 text-zinc-200 font-medium">Conexión directa con 1 clic</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-zinc-200">Tipos de cuenta</td>
                    <td className="px-6 py-3.5 text-zinc-500">Depende del cliente de cada usuario</td>
                    <td className="px-6 py-3.5 text-zinc-200 font-medium">Microsoft y offline integrados</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* PLANES Y PRECIOS */}
        <section id="precios" className="py-16 border-t border-zinc-800/80 bg-[#0e0e11] px-6 lg:px-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Planes
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                Precios sencillos y transparentes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* FREE */}
              <div className="p-6 bg-[#121215] border border-zinc-800 rounded-xl flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plan Free</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-zinc-100">$0</span>
                    <span className="text-xs text-zinc-500">/ siempre</span>
                  </div>
                  <p className="text-xs text-zinc-400">Ideal para comunidades pequeñas entre amigos.</p>

                  <ul className="space-y-2 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-zinc-400" />
                      <span>1 Servidor / Launcher activo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Catálogo de Modrinth completo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Página pública de descarga</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400">
                      <span>• Anuncios discretos en panel</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/register"
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-semibold transition text-center border border-zinc-800"
                >
                  Comenzar gratis
                </Link>
              </div>

              {/* PRO */}
              <div className="p-6 bg-[#121215] border-2 border-emerald-500 rounded-xl flex flex-col justify-between space-y-6 relative shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Plan PRO</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Recomendado
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-zinc-100">$4.99</span>
                    <span className="text-xs text-zinc-400">/ mes</span>
                  </div>
                  <p className="text-xs text-zinc-400">Para servidores activos con mods personalizados.</p>

                  <ul className="space-y-2 pt-4 border-t border-zinc-800 text-xs text-zinc-200">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-zinc-100">Cero anuncios (Ad-free)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Launchers ilimitados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Subida de archivos .jar propios</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tablón de noticias en el launcher</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Marca blanca y personalización</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/register"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition text-center shadow-sm"
                >
                  Elegir Plan PRO
                </Link>
              </div>

              {/* LIFETIME */}
              <div className="p-6 bg-[#121215] border border-zinc-800 rounded-xl flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plan Lifetime</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-zinc-100">$29.99</span>
                    <span className="text-xs text-zinc-500">/ pago único</span>
                  </div>
                  <p className="text-xs text-zinc-400">Acceso completo permanente sin renovaciones.</p>

                  <ul className="space-y-2 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-zinc-100">Sin anuncios permanente</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Todas las funciones del Plan PRO</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Sin cobros mensuales futuros</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/register"
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-semibold transition text-center border border-zinc-800"
                >
                  Comprar Lifetime
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PREGUNTAS FRECUENTES */}
        <section id="faq" className="py-16 border-t border-zinc-800/80 px-6 lg:px-12 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#121215] border border-zinc-800 rounded-lg overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-medium text-zinc-200 hover:text-white transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#0e0e11] py-8 px-6 lg:px-12 text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ElysiumPad" className="w-6 h-6 rounded object-contain" />
            <span className="font-semibold text-zinc-300">ElysiumPad</span>
            <span className="text-zinc-600">•</span>
            <span>Gestor de launchers para Minecraft</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-200 transition">Panel</Link>
            <Link href="/login" className="hover:text-zinc-200 transition">Entrar</Link>
            <Link href="/terms" className="hover:text-zinc-200 transition">Términos</Link>
            <Link href="/privacy" className="hover:text-zinc-200 transition">Privacidad</Link>
          </div>

          <p className="text-[11px] text-zinc-600">
            © {new Date().getFullYear()} ElysiumPad. No afiliado con Mojang ni Microsoft.
          </p>
        </div>
      </footer>
    </div>
  );
}
