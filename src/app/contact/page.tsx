import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Shield, Send, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Contacto y Soporte Técnico — ElysiumPad',
  description: 'Canales de asistencia, soporte técnico oficial y consultas para usuarios y administradores de ElysiumPad.',
};

export default function ContactPage() {
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
              Atención y Soporte
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-3 border-b border-slate-800 pb-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5" /> Soporte Oficial
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Contacto y Asistencia al Cliente
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            ¿Tienes dudas técnicas, problemas con la configuración de tu launcher o preguntas sobre planes de suscripción y facturación? Nuestro equipo está disponible para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Canales directos */}
          <div className="space-y-4">
            <div className="bg-[#121824] border border-[#1e2739] p-6 rounded-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" /> Correo Electrónico
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para consultas de cuenta, temas de facturación, incidencias técnicas o solicitudes de derechos de privacidad:
              </p>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 select-all">
                soporte@elysiumpad.com
              </div>
              <p className="text-[11px] text-slate-500">
                Tiempo de respuesta habitual: menos de 24 horas en días laborables.
              </p>
            </div>

            <div className="bg-[#121824] border border-[#1e2739] p-6 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Seguridad y Reportes
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Si detectas vulnerabilidades, fallos de seguridad o distribución de contenido no autorizado conforme a las directrices de Mojang y el EULA, escríbenos directamente a:
              </p>
              <span className="text-xs font-mono text-slate-200 block">security@elysiumpad.com</span>
            </div>
          </div>

          {/* Información del servicio y garantía */}
          <div className="bg-[#121824] border border-[#1e2739] p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white">Compromiso de Asistencia</h2>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Soporte activo para administradores y comunidades de Minecraft.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Ayuda en la migración e integración de mods desde Modrinth.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Asistencia en pagos y cancelaciones inmediatas sin complicaciones.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-400 block">¿Tienes una cuenta activa?</span>
              <p className="text-[11px] text-slate-300">
                Puedes acceder al panel de control para gestionar tus servidores o editar tus launchers al instante.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-block text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 rounded-lg transition"
                >
                  Ir al Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b2333] bg-[#0b0e15] py-6 px-6 text-xs text-slate-500 text-center">
        <p>© {new Date().getFullYear()} ElysiumPad. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
