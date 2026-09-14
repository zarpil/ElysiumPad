import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Contacto y Soporte Técnico — ElysiumPad',
  description: 'Canales de asistencia, soporte técnico oficial y consultas para usuarios y administradores de ElysiumPad.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#0e0e11] sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
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
              Atención y Soporte
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-3 border-b border-zinc-800/80 pb-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Soporte Oficial</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight">
            Contacto y Asistencia al Cliente
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
            ¿Tienes dudas técnicas, problemas con la configuración de tu launcher o preguntas sobre planes de suscripción y facturación? Nuestro equipo está disponible para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Canales directos */}
          <div className="space-y-4">
            <div className="bg-[#121215] border border-zinc-800 p-6 rounded-xl space-y-4 shadow-sm">
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" /> Correo Electrónico
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Para consultas de cuenta, temas de facturación, incidencias técnicas o solicitudes de derechos de privacidad:
              </p>
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-emerald-400 select-all">
                soporte@elysiumpad.com
              </div>
              <p className="text-[11px] text-zinc-500">
                Tiempo de respuesta habitual: menos de 24 horas en días laborables.
              </p>
            </div>

            <div className="bg-[#121215] border border-zinc-800 p-6 rounded-xl space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Seguridad y Reportes
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Si detectas vulnerabilidades, fallos de seguridad o distribución de contenido no autorizado conforme a las directrices de Mojang y el EULA, escríbenos directamente a:
              </p>
              <span className="text-xs font-mono text-zinc-300 block">security@elysiumpad.com</span>
            </div>
          </div>

          {/* Información del servicio y garantía */}
          <div className="bg-[#121215] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-zinc-100">Compromiso de Asistencia</h2>
              <ul className="space-y-3 text-xs text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Soporte activo para administradores y comunidades de Minecraft.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Ayuda en la migración e integración de mods desde Modrinth.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Asistencia en pagos y cancelaciones inmediatas sin complicaciones.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1">
              <span className="text-xs font-semibold text-zinc-100 block">¿Tienes una cuenta activa?</span>
              <p className="text-[11px] text-zinc-400">
                Puedes acceder al panel de control para gestionar tus servidores o editar tus launchers al instante.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-block text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition"
                >
                  Ir al Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#0e0e11] py-8 px-6 lg:px-12 text-xs text-zinc-500 text-center">
        <p>© {new Date().getFullYear()} ElysiumPad. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
