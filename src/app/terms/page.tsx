import React from 'react';
import Link from 'next/link';
import { Scale, Calendar } from 'lucide-react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';

export const metadata = {
  title: 'Términos de Servicio y Condiciones de Contratación — ElysiumPad',
  description: 'Términos de uso, condiciones de suscripción mensual y política de cancelación de ElysiumPad.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Header unificado */}
      <PublicNavbar />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-3 border-b border-zinc-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>Marco Legal y Normativa de Contratación</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-xs text-zinc-400">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-zinc-300">
          {/* 1. Introducción */}
          <section className="space-y-3 bg-[#121215] border border-zinc-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">01.</span> Identificación y Objeto del Servicio
            </h2>
            <p>
              Bienvenido a <strong className="text-zinc-100">ElysiumPad</strong>. Estos Términos y Condiciones regulan el acceso, navegación y utilización de la plataforma tecnológica SaaS ofrecida para la creación, configuración, sincronización de mods y distribución de clientes y ejecutables para servidores de Minecraft.
            </p>
            <p>
              Al registrar una cuenta, acceder o suscribirse a cualquiera de nuestros planes, el usuario acepta de manera expresa e íntegra el cumplimiento de las presentes cláusulas legales.
            </p>
          </section>

          {/* 2. Planes y Facturación */}
          <section className="space-y-4 bg-[#121215] border border-zinc-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">02.</span> Modalidades de Acceso y Planes
            </h2>
            <p>
              ElysiumPad pone a disposición de sus usuarios tres modalidades de servicio:
            </p>
            <ul className="space-y-2 list-disc list-inside text-zinc-300 pl-2">
              <li>
                <strong className="text-zinc-100">Plan Gratuito (FREE):</strong> Permite la creación de 1 launcher activo con sincronización de mods del catálogo oficial de Modrinth. Financiado de forma sostenible mediante anuncios discretos.
              </li>
              <li>
                <strong className="text-zinc-100">Plan PRO (Suscripción Mensual - $4.99 USD / mes):</strong> Permite la creación de launchers ilimitados, subida de archivos y mods propios (.jar), enlaces Slug URL personalizados, tablón de comunicados en tiempo real y eliminación completa de publicidad (White-Label).
              </li>
              <li>
                <strong className="text-zinc-100">Plan LIFETIME (Licencia Vitalicia - $49 USD pago único):</strong> Otorga todos los beneficios del Plan PRO de forma permanente de por vida, sin pagos mensuales posteriores ni renovaciones.
              </li>
            </ul>
          </section>

          {/* 3. Renovación y Cancelación */}
          <section className="space-y-4 bg-[#121215] border border-zinc-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">03.</span> Renovación Recurrente y Cancelación Autónoma
            </h2>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Calendar className="w-4 h-4" /> Política de Cancelación sin Permanencia
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                El usuario suscrito al <strong className="text-zinc-100">Plan PRO</strong> autoriza la renovación automática mensual del cobro recurrente ($4.99 USD). De conformidad con las normativas internacionales de protección al consumidor y directivas de comercio digital:
              </p>
            </div>
            <ul className="space-y-2 list-disc list-inside text-zinc-300 pl-2">
              <li>
                <strong className="text-zinc-100">Cancelación con 1 solo clic:</strong> El usuario tiene derecho a cancelar su suscripción mensual en cualquier momento de manera autónoma desde su panel de control (<Link href="/profile" className="text-emerald-400 underline">Mi Perfil &gt; Facturación</Link>).
              </li>
              <li>
                <strong className="text-zinc-100">Sin compromisos ni penalizaciones:</strong> La cancelación no conlleva ningún tipo de comisión, penalización ni obligación de permanencia mínima.
              </li>
              <li>
                <strong className="text-zinc-100">Efectos de la cancelación:</strong> Al cancelar, no se realizará ningún cargo futuro y la cuenta retornará al Plan Gratuito (FREE), conservando íntegros los datos y configuraciones previamente creados.
              </li>
            </ul>
          </section>

          {/* 4. Seguridad de Pagos */}
          <section className="space-y-3 bg-[#121215] border border-zinc-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">04.</span> Pasarela de Pagos y Seguridad Financiera
            </h2>
            <p>
              Las transacciones monetarias son procesadas a través de pasarelas de pago certificadas de nivel bancario (como <strong className="text-zinc-100">Stripe</strong>) bajo el estándar <strong className="text-zinc-100">PCI-DSS Nivel 1</strong>.
            </p>
            <p>
              ElysiumPad <strong className="text-zinc-100">nunca almacena ni tiene acceso a los números completos de tarjeta de crédito o débito ni a los códigos de seguridad CVV/CVC</strong>. Toda la comunicación sensible viaja cifrada mediante protocolo SSL/TLS con encriptación de 256 bits.
            </p>
          </section>

          {/* 5. EULA Minecraft */}
          <section className="space-y-3 bg-[#121215] border border-zinc-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">05.</span> Relación con Mojang Studios y Microsoft
            </h2>
            <p>
              ElysiumPad es una plataforma independiente y <strong className="text-zinc-100">NO está afiliada, respaldada ni patrocinada por Mojang Studios, Microsoft Corporation ni ninguna de sus filiales</strong>. Minecraft es una marca registrada de Mojang Synergies AB.
            </p>
            <p>
              El usuario se compromete a respetar en todo momento las directrices de uso y el Contrato de Licencia para el Usuario Final (EULA) de Minecraft en los servidores y launchers que configure en la plataforma.
            </p>
          </section>

          {/* 6. Responsabilidad del Contenido */}
          <section className="space-y-3 bg-[#121215] border border-zinc-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">06.</span> Responsabilidad del Usuario sobre Mods y Archivos
            </h2>
            <p>
              El usuario que suba archivos personalizados (.jar, configuraciones, banners o logotipos) garantiza que ostenta los derechos, autorizaciones o licencias de código abierto necesarias para su distribución. Queda terminantemente prohibido el alojamiento o distribución de malware, software espía, exploits o cualquier archivo malicioso.
            </p>
          </section>
        </div>
      </main>

      {/* Footer unificado */}
      <PublicFooter />
    </div>
  );
}
