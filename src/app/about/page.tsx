import React from 'react';
import Link from 'next/link';
import { Users, Shield, Rocket, Heart, Code2, CheckCircle2 } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export const metadata = {
  title: 'Sobre Nosotros — Quiénes somos y Nuestra Misión | ElysiumPad',
  description: 'Conoce al equipo detrás de ElysiumPad, nuestra filosofía de infraestructura y cómo ayudamos a las comunidades de Minecraft a crecer sin barreras técnicas.',
};

export default function AboutPage() {
  const values = [
    {
      icon: Rocket,
      title: 'Cero Fricción para el Jugador',
      desc: 'Creemos que disfrutar de un servidor con mods no debería requerir instalar Java manualmente ni lidiar con carpetas comprimidas. La tecnología debe ser transparente e invisible para el usuario final.',
    },
    {
      icon: Code2,
      title: 'Ecosistema Abierto y Modrinth',
      desc: 'Apostamos por la interoperabilidad con repositorios abiertos y seguros. Integramos APIs públicas para verificar sumas de comprobación criptográficas (SHA) de cada archivo.',
    },
    {
      icon: Shield,
      title: 'Seguridad y Privacidad Primero',
      desc: 'Nuestros ejecutables no contienen software publicitario invasivo ni rastreadores ocultos. Tratamos los datos con estricto apego al RGPD y normativas internacionales de privacidad.',
    },
    {
      icon: Heart,
      title: 'Pasión por la Comunidad',
      desc: 'Nacimos como administradores de servidores. Diseñamos las herramientas que nosotros mismos necesitábamos para que cualquier creador pueda competir con las grandes redes de juego.',
    },
  ];

  const team = [
    {
      name: 'Alex Vance',
      role: 'Lead Systems & JVM Architect',
      bio: 'Especialista en entornos de ejecución Java, recolección de basura y distribución de software de alto rendimiento. Más de 8 años optimizando clientes y servidores de Minecraft.',
      avatarBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      initials: 'AV',
    },
    {
      name: 'Marco Keller',
      role: 'Core Backend & Network Engineer',
      bio: 'Desarrollador enfocado en arquitecturas SaaS, almacenamiento en la nube S3/R2 y APIs de sincronización diferencial en tiempo real para comunidades masivas.',
      avatarBg: 'bg-zinc-800 text-zinc-200 border-zinc-700',
      initials: 'MK',
    },
    {
      name: 'Equipo Editorial & Soporte',
      role: 'Comunidad & Recursos Técnicos',
      bio: 'Equipo dedicado a la documentación técnica, guías de rendimiento, análisis de modloaders y asistencia personalizada a administradores de servidores.',
      avatarBg: 'bg-zinc-800 text-emerald-400 border-zinc-700',
      initials: 'EP',
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Header unificado */}
      <PublicNavbar />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nuestra Historia y Propósito</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-100 tracking-tight max-w-3xl mx-auto leading-tight">
            Construyendo la infraestructura moderna para comunidades de Minecraft
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            ElysiumPad nació con un objetivo simple y claro: democratizar la creación de launchers personalizados para que cualquier administrador de servidores pueda ofrecer una experiencia profesional a sus jugadores sin complicaciones técnicas.
          </p>
        </div>

        {/* Quiénes somos - Detalle */}
        <section className="bg-[#121215] border border-zinc-800 p-8 md:p-10 rounded-xl space-y-6 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Nuestra Misión
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              El mundo del modding en Minecraft es uno de los fenómenos creativos más ricos del videojuego contemporáneo. Sin embargo, para los jugadores noveles o las comunidades que buscan expandirse, la barrera técnica siempre ha sido una muralla: versiones conflictivas de Java, modloaders que no coinciden, fallos de librerías y actualizaciones manuales que rompen partidas enteras.
            </p>
            <p>
              En <strong className="text-zinc-100">ElysiumPad</strong> diseñamos una plataforma SaaS integral que unifica la gestión de clientes, la distribución en tiempo real y la sincronización con repositorios oficiales como <strong className="text-emerald-400">Modrinth</strong>. A través de un manifiesto inteligente, los jugadores descargan un único archivo ejecutable que detecta, repara y sincroniza todo lo necesario de manera automática.
            </p>
          </div>
        </section>

        {/* Pilares y Valores */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Principios Fundamentales</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">Cómo trabajamos en ElysiumPad</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((v, i) => {
              const IconComp = v.icon;
              return (
                <div key={i} className="bg-[#121215] border border-zinc-800 p-6 rounded-xl space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100">{v.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Equipo Técnico detrás del Proyecto (E-E-A-T) */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Equipo Técnico y Editorial</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">Experiencia que impulsa la plataforma</h2>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto">
              Nuestras guías técnicas y desarrollos son coordinados por ingenieros con años de trayectoria administrando redes de juego y arquitectura de sistemas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {team.map((member, i) => (
              <div key={i} className="bg-[#121215] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-lg border flex items-center justify-center font-bold text-sm ${member.avatarBg}`}>
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{member.name}</h3>
                    <p className="text-[11px] text-emerald-400 font-medium">{member.role}</p>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Equipo Verificado</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Declaración de Independencia */}
        <section className="bg-[#0e0e11] border border-zinc-800 rounded-xl p-6 text-center space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Aviso de Marca e Independencia</span>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            ElysiumPad es una plataforma tecnológica independiente y no está vinculada, patrocinada ni afiliada a Mojang Studios, Microsoft Corporation ni a sus filiales. Minecraft es una marca registrada de Mojang Synergies AB. Respetamos y promovemos el cumplimiento continuo del Contrato de Licencia para el Usuario Final (EULA) de Minecraft.
          </p>
        </section>

        {/* CTA */}
        <div className="p-8 bg-[#121215] border border-zinc-800 rounded-xl text-center space-y-4 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-zinc-100">¿Tienes preguntas sobre nuestro proyecto?</h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Estamos abiertos a sugerencias, consultas técnicas y alianzas con comunidades de creadores de contenido.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/contact"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition shadow-sm"
            >
              Contactar con el Equipo
            </Link>
            <Link
              href="/docs"
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs px-4 py-2.5 rounded-lg border border-zinc-800 transition"
            >
              Explorar Recursos
            </Link>
          </div>
        </div>
      </main>

      {/* Footer unificado */}
      <PublicFooter />
    </div>
  );
}
