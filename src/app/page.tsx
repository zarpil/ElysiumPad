'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Download,
  Server,
  Package,
  Layers,
  Shield,
  Zap,
  Globe,
  Users,
  ChevronDown,
  ChevronUp,
  Cpu,
  Terminal,
  ExternalLink,
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
      a: 'No. El launcher detecta la versión exacta de Minecraft (1.20.1, 1.21, etc.) y su cargador (Fabric, Forge, NeoForge) y gestiona los componentes necesarios automáticamente en el equipo del jugador.',
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
      a: 'El Plan Free permite crear 1 launcher activo y sincronizar mods directamente desde Modrinth, financiado de forma sostenible mediante anuncios discretos en el panel y launcher (al estilo Aternos). Los planes PRO y Lifetime son 100% libres de publicidad (Ad-free), admiten launchers ilimitados, subida de archivos .jar propios y personalización completa de marca.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-200 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="h-16 border-b border-[#1b2333] bg-[#0f141f] sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shadow-sm">
              EP
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white leading-none">
                ElysiumPad
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                Minecraft Launcher Studio
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#como-funciona" className="hover:text-white transition">
              Cómo funciona
            </a>
            <a href="#caracteristicas" className="hover:text-white transition">
              Características
            </a>
            <a href="#comparativa" className="hover:text-white transition">
              Comparativa
            </a>
            <a href="#precios" className="hover:text-white transition">
              Planes
            </a>
            <a href="#faq" className="hover:text-white transition">
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
                  className="text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-lg transition font-medium"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition font-medium"
              >
                Mi Perfil
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                <span>Panel de Control</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                <span>Crear Launcher Gratis</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 px-6 lg:px-12 max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#131a27] border border-[#1f2a3f] text-slate-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Gestor de Launchers para Comunidades de Minecraft</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Launchers de Minecraft personalizados para tu servidor.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Configura tu servidor, sincroniza mods directamente desde Modrinth y comparte con tus amigos un launcher que se actualiza solo. Sin instalaciones manuales ni carpetas de mods complejas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Empezar con Plan Gratuito</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="#vista-previa"
              className="w-full sm:w-auto px-6 py-3 bg-[#131a27] hover:bg-[#1a2335] text-slate-300 hover:text-white font-semibold text-xs rounded-lg border border-[#1f2a3f] transition flex items-center justify-center gap-2"
            >
              <span>Ver Panel de Demostración</span>
            </a>
          </div>

          {/* Quick specs pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Compatible con Fabric, Forge y NeoForge</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Instalación de mods en 1 clic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Cuentas oficiales y modo offline</span>
            </div>
          </div>

          {/* REALISTIC UI SHOWCASE: ElysiumPad Dashboard Preview */}
          <div id="vista-previa" className="pt-8 text-left">
            <div className="bg-[#111722] border border-[#1e2739] rounded-xl overflow-hidden shadow-2xl">
              {/* Fake Dashboard Top Bar */}
              <div className="h-10 bg-[#0d121c] border-b border-[#1b2333] px-4 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3 font-medium">
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Panel de Control — ElysiumPad
                  </span>
                  <span className="text-slate-600">/</span>
                  <span>Servidor: Survival Amigos</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-emerald-400">mc.amigoscraft.es:25565</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Online (19ms)
                  </span>
                </div>
              </div>

              {/* Realistic Inner Panel Layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 bg-[#111722]">
                {/* Fake Left Sidebar */}
                <div className="p-4 border-r border-[#1b2333] bg-[#0f1420] space-y-4 hidden md:block">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Servidor Activo
                    </span>
                    <div className="p-2.5 bg-[#171f30] border border-[#222d44] rounded-lg">
                      <p className="text-xs font-semibold text-white truncate">Survival Amigos</p>
                      <p className="text-[10px] text-slate-400">1.20.1 Fabric</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="px-3 py-2 bg-slate-800/60 rounded-lg text-white font-medium flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Servidor</span>
                    </div>
                    <div className="px-3 py-2 text-slate-400 hover:text-slate-200 rounded-lg flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>Opciones</span>
                    </div>
                    <div className="px-3 py-2 text-slate-400 hover:text-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>Mods</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
                        4
                      </span>
                    </div>
                    <div className="px-3 py-2 text-slate-400 hover:text-slate-200 rounded-lg flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>Compartir</span>
                    </div>
                  </div>
                </div>

                {/* Fake Content Area */}
                <div className="p-6 md:col-span-3 space-y-6">
                  {/* Status Card */}
                  <div className="p-5 bg-[#141b29] border border-[#1f2a3f] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">Survival Amigos</h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Fabric 1.20.1
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        IP del servidor: <strong className="text-slate-200 font-mono">mc.amigoscraft.es:25565</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-sm">
                        Listo para Compartir
                      </span>
                    </div>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-[#141b29] border border-[#1f2a3f] rounded-xl">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Versión Minecraft
                      </span>
                      <p className="text-lg font-bold text-white mt-1">1.20.1</p>
                      <span className="text-[11px] text-emerald-400">Fabric Loader</span>
                    </div>

                    <div className="p-4 bg-[#141b29] border border-[#1f2a3f] rounded-xl">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Mods Instalados
                      </span>
                      <p className="text-lg font-bold text-white mt-1">4 mods activos</p>
                      <span className="text-[11px] text-slate-400">Sincronizados con Modrinth</span>
                    </div>

                    <div className="p-4 bg-[#141b29] border border-[#1f2a3f] rounded-xl">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Modo de Cuentas
                      </span>
                      <p className="text-lg font-bold text-white mt-1">Premium & Offline</p>
                      <span className="text-[11px] text-slate-400">RAM recomendada: 4 GB</span>
                    </div>
                  </div>

                  {/* Mods preview list inside showcase */}
                  <div className="p-4 bg-[#141b29] border border-[#1f2a3f] rounded-xl space-y-2.5">
                    <span className="text-xs font-bold text-white block">
                      Mods Sincronizados en este Servidor
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { name: 'Sodium', file: 'sodium-fabric-0.5.8+mc1.20.1.jar', desc: 'Optimización de FPS' },
                        { name: 'Iris Shaders', file: 'iris-mc1.20.1-1.7.0.jar', desc: 'Soporte para Shaders' },
                        { name: 'Create', file: 'create-fabric-0.5.1-1.20.1.jar', desc: 'Maquinaria y automatización' },
                        { name: 'Simple Voice Chat', file: 'voicechat-fabric-1.20.1-2.4.28.jar', desc: 'Chat de voz por proximidad' },
                      ].map((m) => (
                        <div
                          key={m.name}
                          className="p-2.5 bg-[#0f1420] border border-[#1b2333] rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-white text-xs">{m.name}</p>
                            <p className="text-[10px] text-slate-400">{m.desc}</p>
                          </div>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                            Modrinth
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: HOW IT WORKS */}
        <section id="como-funciona" className="py-16 border-t border-[#1b2333] bg-[#0e131d] px-6 lg:px-12">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Flujo de Trabajo
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Cómo funciona para ti y para tus jugadores
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Sin necesidad de configurar servidores de descarga manuales ni escribir scripts complejos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-[#121824] border border-[#1d2638] rounded-xl space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="text-sm font-bold text-white">Configura tu servidor</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Indica la versión de Minecraft, el cargador de mods (Fabric o Forge) y la IP de tu servidor.
                </p>
              </div>

              <div className="p-6 bg-[#121824] border border-[#1d2638] rounded-xl space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-sm font-bold text-white">Elige tus mods en 1 clic</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Busca directamente en el catálogo de Modrinth o añade tus archivos .jar propios. Los hashes y versiones se verifican automáticamente.
                </p>
              </div>

              <div className="p-6 bg-[#121824] border border-[#1d2638] rounded-xl space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">Comparte tu enlace</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tus amigos descargan el launcher preconfigurado. Al abrirlo, sincroniza los mods y se conecta a tu IP al pulsar "Jugar".
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: COMPARATIVE TABLE */}
        <section id="comparativa" className="py-16 border-t border-[#1b2333] px-6 lg:px-12">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Comparativa
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Distribución manual vs ElysiumPad
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Compara el proceso tradicional de compartir mods frente a un launcher automatizado.
              </p>
            </div>

            <div className="bg-[#111722] border border-[#1d2638] rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f1420] border-b border-[#1d2638] text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Funcionalidad</th>
                    <th className="px-6 py-3.5 text-slate-500">Distribución Manual (ZIP / Drive)</th>
                    <th className="px-6 py-3.5 text-emerald-400 font-bold">Con ElysiumPad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2333] text-slate-300">
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-white">Actualización de mods</td>
                    <td className="px-6 py-3.5 text-slate-400">Volver a subir y descargar el ZIP completo</td>
                    <td className="px-6 py-3.5 text-emerald-400 font-semibold">Automática en segundo plano</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-white">Gestión de Java y Loader</td>
                    <td className="px-6 py-3.5 text-slate-400">Instalación manual por cada jugador</td>
                    <td className="px-6 py-3.5 text-emerald-400 font-semibold">Integrada en el launcher</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-white">Conexión al Servidor</td>
                    <td className="px-6 py-3.5 text-slate-400">Copiar y pegar IP manualmente</td>
                    <td className="px-6 py-3.5 text-emerald-400 font-semibold">Conexión directa con un clic</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-white">Compatibilidad de Cuentas</td>
                    <td className="px-6 py-3.5 text-slate-400">Depende de launchers de terceros</td>
                    <td className="px-6 py-3.5 text-emerald-400 font-semibold">Microsoft y modo offline configurables</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-white">Página de Descarga para la Comunidad</td>
                    <td className="px-6 py-3.5 text-slate-400">Links de Google Drive / Mediafire</td>
                    <td className="px-6 py-3.5 text-emerald-400 font-semibold">Página dedicada con estado del servidor</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-white">Publicidad y Patrocinios</td>
                    <td className="px-6 py-3.5 text-slate-400">Acortadores con malware y captchas</td>
                    <td className="px-6 py-3.5 text-emerald-400 font-semibold">Anuncios limpios y seguros (Free) / Cero anuncios (PRO)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-medium text-white">Anuncios y Noticias a Jugadores</td>
                    <td className="px-6 py-3.5 text-slate-400">Canales de Discord ignorados por jugadores</td>
                    <td className="px-6 py-3.5 text-emerald-400 font-semibold">Tablón de noticias y eventos directos en el launcher (PRO)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION: PRICING */}
        <section id="precios" className="py-16 border-t border-[#1b2333] bg-[#0e131d] px-6 lg:px-12">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Planes y Precios
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Precios claros, sin costes ocultos
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Comienza sin coste con tu primer servidor o amplía cuando necesites subir archivos personalizados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* FREE */}
              <div className="p-6 bg-[#121824] border border-[#1d2638] rounded-xl flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan Free</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">$0</span>
                    <span className="text-xs text-slate-400">/ siempre</span>
                  </div>
                  <p className="text-xs text-slate-400">Para servidores pequeños entre amigos.</p>

                  <ul className="space-y-2.5 pt-4 border-t border-[#1d2638] text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1 Launcher activo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Catálogo completo de Modrinth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Página pública de descarga</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Soporte Premium y No-Premium</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold text-amber-400">⚡</span>
                      <span>Con anuncios (Panel y Launcher)</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/register"
                  className="w-full py-2.5 bg-[#172030] hover:bg-[#1f2a3f] text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition text-center border border-[#222d42]"
                >
                  Comenzar Gratis
                </Link>
              </div>

              {/* PRO */}
              <div className="p-6 bg-[#141d2d] border-2 border-emerald-500/80 rounded-xl flex flex-col justify-between space-y-6 shadow-xl relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Plan PRO</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Popular
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">$4.99</span>
                    <span className="text-xs text-slate-400">/ mes</span>
                  </div>
                  <p className="text-xs text-slate-400">Para servidores activos y comunidades que requieren mods propios.</p>

                  <ul className="space-y-2.5 pt-4 border-t border-[#1f2a3f] text-xs text-slate-200">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-emerald-300">100% Sin anuncios (Ad-free)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-white">Tablón de noticias propio en el launcher</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-white">Launchers ilimitados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-white">Subida de archivos .jar propios</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Carpetas de configuración personalizadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Marca blanca (sin marca de agua)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Personalización de banner y logos</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/register"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition text-center shadow-sm"
                >
                  Elegir Plan PRO
                </Link>
              </div>

              {/* LIFETIME */}
              <div className="p-6 bg-[#121824] border border-[#1d2638] rounded-xl flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Plan Lifetime</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">$49</span>
                    <span className="text-xs text-slate-400">/ pago único</span>
                  </div>
                  <p className="text-xs text-slate-400">Pago único sin mensualidades recurrentes.</p>

                  <ul className="space-y-2.5 pt-4 border-t border-[#1d2638] text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-amber-300">100% Sin anuncios para siempre</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-white">Tablón de noticias y eventos ilimitado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-white">Todas las funciones PRO para siempre</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sin renovaciones ni cobros futuros</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Soporte prioritario</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/register"
                  className="w-full py-2.5 bg-[#172030] hover:bg-[#1f2a3f] text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition text-center border border-[#222d42]"
                >
                  Adquirir Licencia Lifetime
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: FAQ */}
        <section id="faq" className="py-16 border-t border-[#1b2333] px-6 lg:px-12 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Preguntas Frecuentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Respuestas a dudas comunes
            </h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#121824] border border-[#1d2638] rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-[#1d2638] pt-3">
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
      <footer className="border-t border-[#1b2333] bg-[#0b0e15] py-10 px-6 lg:px-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
              EP
            </div>
            <div>
              <p className="font-bold text-white text-xs">ElysiumPad</p>
              <p className="text-[11px] text-slate-500">Gestión y distribución de launchers para servidores de Minecraft</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition">
              Panel de Servidores
            </Link>
            <Link href="/admin" className="hover:text-white transition">
              Consola Admin
            </Link>
            <Link href="/login" className="hover:text-white transition">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="hover:text-white transition">
              Registro
            </Link>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} ElysiumPad. No afiliado con Mojang ni Microsoft.
          </p>
        </div>
      </footer>
    </div>
  );
}
