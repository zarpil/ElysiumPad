import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, CheckCircle2, Scale, Calendar, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Términos de Servicio y Condiciones de Contratación — ElysiumPad',
  description: 'Términos de uso, condiciones de suscripción mensual y política de cancelación de ElysiumPad.',
};

export default function TermsPage() {
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
              Condiciones Legales
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
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Scale className="w-3.5 h-3.5" /> Marco Legal y Normativa de Contratación
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-xs text-slate-400">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed text-slate-300">
          {/* 1. Introducción */}
          <section className="space-y-3 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">01.</span> Identificación y Objeto del Servicio
            </h2>
            <p>
              Bienvenido a <strong>ElysiumPad</strong>. Estos Términos y Condiciones regulan el acceso, navegación y utilización de la plataforma tecnológica SaaS ofrecida para la creación, configuración, sincronización de mods y distribución de clientes y ejecutables para servidores de Minecraft.
            </p>
            <p>
              Al registrar una cuenta, acceder o suscribirse a cualquiera de nuestros planes, el usuario acepta de manera expresa e íntegra el cumplimiento de las presentes cláusulas legales.
            </p>
          </section>

          {/* 2. Planes y Facturación */}
          <section className="space-y-4 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">02.</span> Modalidades de Acceso y Planes
            </h2>
            <p>
              ElysiumPad pone a disposición de sus usuarios tres modalidades de servicio:
            </p>
            <ul className="space-y-2 list-disc list-inside text-slate-300 pl-2">
              <li>
                <strong>Plan Gratuito (FREE):</strong> Permite la creación de 1 launcher activo con sincronización de mods del catálogo oficial de Modrinth. Financiado de forma sostenible mediante anuncios discretos.
              </li>
              <li>
                <strong>Plan PRO (Suscripción Mensual - $4.99 USD / mes):</strong> Permite la creación de launchers ilimitados, subida de archivos y mods propios (.jar), enlaces Slug URL personalizados, tablón de comunicados en tiempo real y eliminación completa de publicidad (White-Label).
              </li>
              <li>
                <strong>Plan LIFETIME (Licencia Vitalicia - $49 USD pago único):</strong> Otorga todos los beneficios del Plan PRO de forma permanente de por vida, sin pagos mensuales posteriores ni renovaciones.
              </li>
            </ul>
          </section>

          {/* 3. Renovación y Cancelación */}
          <section className="space-y-4 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">03.</span> Renovación Recurrente y Cancelación Autónoma
            </h2>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Calendar className="w-4 h-4" /> Política de Cancelación sin Permanencia
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                El usuario suscrito al <strong>Plan PRO</strong> autoriza la renovación automática mensual del cobro recurrente ($4.99 USD). De conformidad con las normativas internacionales de protección al consumidor y directivas de comercio digital:
              </p>
            </div>
            <ul className="space-y-2 list-disc list-inside text-slate-300 pl-2">
              <li>
                <strong>Cancelación con 1 solo clic:</strong> El usuario tiene derecho a cancelar su suscripción mensual en cualquier momento de manera autónoma desde su panel de control (<Link href="/profile" className="text-emerald-400 underline">Mi Perfil &gt; Facturación</Link>).
              </li>
              <li>
                <strong>Sin compromisos ni penalizaciones:</strong> La cancelación no conlleva ningún tipo de comisión, penalización ni obligación de permanencia mínima.
              </li>
              <li>
                <strong>Efectos de la cancelación:</strong> Al cancelar, no se realizará ningún cargo futuro y la cuenta retornará al Plan Gratuito (FREE), conservando íntegros los datos y configuraciones previamente creados.
              </li>
            </ul>
          </section>

          {/* 4. Seguridad de Pagos */}
          <section className="space-y-3 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">04.</span> Pasarela de Pagos y Seguridad Financiera
            </h2>
            <p>
              Las transacciones monetarias son procesadas a través de pasarelas de pago certificadas de nivel bancario (como <strong>Stripe</strong>) bajo el estándar <strong>PCI-DSS Nivel 1</strong>.
            </p>
            <p>
              ElysiumPad <strong>nunca almacena ni tiene acceso a los números completos de tarjeta de crédito o débito ni a los códigos de seguridad CVV/CVC</strong>. Toda la comunicación sensible viaja cifrada mediante protocolo SSL/TLS con encriptación de 256 bits.
            </p>
          </section>

          {/* 5. EULA Minecraft */}
          <section className="space-y-3 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">05.</span> Relación con Mojang Studios y Microsoft
            </h2>
            <p>
              ElysiumPad es una plataforma independiente y <strong>NO está afiliada, respaldada ni patrocinada por Mojang Studios, Microsoft Corporation ni ninguna de sus filiales</strong>. Minecraft es una marca registrada de Mojang Synergies AB.
            </p>
            <p>
              El usuario se compromete a respetar en todo momento las directrices de uso y el Contrato de Licencia para el Usuario Final (EULA) de Minecraft en los servidores y launchers que configure en la plataforma.
            </p>
          </section>

          {/* 6. Responsabilidad del Contenido */}
          <section className="space-y-3 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">06.</span> Responsabilidad del Usuario sobre Mods y Archivos
            </h2>
            <p>
              El usuario que suba archivos personalizados (.jar, configuraciones, banners o logotipos) garantiza que ostenta los derechos, autorizaciones o licencias de código abierto necesarias para su distribución. Queda terminantemente prohibido el alojamiento o distribución de malware, software espía, exploits o cualquier archivo malicioso.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b2333] bg-[#0b0e15] py-6 px-6 text-xs text-slate-500 text-center">
        <p>© {new Date().getFullYear()} ElysiumPad. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
