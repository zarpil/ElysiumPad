import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Cookie, Database, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad y Cookies — ElysiumPad',
  description: 'Tratamiento de datos personales, cookies técnicas y seguridad en la plataforma ElysiumPad.',
};

export default function PrivacyPage() {
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
              Protección de Datos
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
            <Shield className="w-3.5 h-3.5" /> Cumplimiento de Privacidad y Normativa RGPD
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Política de Privacidad y Cookies
          </h1>
          <p className="text-xs text-slate-400">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed text-slate-300">
          {/* 1. Responsable */}
          <section className="space-y-3 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">01.</span> Compromiso con tu Privacidad
            </h2>
            <p>
              En <strong>ElysiumPad</strong> valoramos y respetamos la confidencialidad de nuestros usuarios. Esta Política de Privacidad describe qué información personal recopilamos, con qué fines se utiliza, cómo la protegemos y los derechos que te asisten bajo el Reglamento General de Protección de Datos (RGPD / GDPR) y normativas afines.
            </p>
          </section>

          {/* 2. Datos recopilados */}
          <section className="space-y-4 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">02.</span> Datos que Recopilamos
            </h2>
            <p>Únicamente recopilamos los datos estrictamente necesarios para la prestación de nuestros servicios:</p>
            <ul className="space-y-2 list-disc list-inside text-slate-300 pl-2">
              <li>
                <strong>Datos de Registro:</strong> Correo electrónico y nombre o apodo que elijas.
              </li>
              <li>
                <strong>Credenciales de Acceso:</strong> Tu contraseña, la cual <strong>siempre se almacena encriptada mediante algoritmo hash irreversible bcrypt</strong> con factor de coste de seguridad. Nadie, ni siquiera nuestro equipo técnico, puede ver tu contraseña original.
              </li>
              <li>
                <strong>Datos de Seguridad y Conexión:</strong> Dirección IP anónima y cabeceras de red requeridas exclusivamente para la prevención de ataques DoS, sistemas de rate limiting y auditoría de accesos.
              </li>
              <li>
                <strong>Configuración de Servidores:</strong> Nombre de tus launchers, versiones de juego y listas de mods que configuras voluntariamente.
              </li>
            </ul>
          </section>

          {/* 3. Pagos seguros */}
          <section className="space-y-3 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">03.</span> Tratamiento de Información de Pago
            </h2>
            <p>
              Cuando realizas un pago para el <strong>Plan PRO</strong> o <strong>Plan LIFETIME</strong>, la transacción se efectúa directamente a través de pasarelas de pago seguras y certificadas (como Stripe).
            </p>
            <p>
              ElysiumPad <strong>NO recopila, no procesa y no almacena datos de tarjetas bancarias</strong> en sus propios servidores. Solo recibimos confirmaciones cifradas de pago (tokens de transacción) para activar tu suscripción.
            </p>
          </section>

          {/* 4. Política de Cookies */}
          <section className="space-y-4 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">04.</span> Política de Cookies y Tecnologías Similares
            </h2>
            <p>
              ElysiumPad utiliza únicamente <strong>cookies técnicas estrictamente esenciales</strong> para el funcionamiento de la plataforma:
            </p>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Cookie className="w-4 h-4 text-emerald-400" /> Cookie de Autenticación: <code className="text-emerald-400 font-mono text-[11px]">elysium_token</code>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cookie HTTP-Only protegida con SameSite=Lax. Se utiliza exclusivamente para mantener tu sesión activa de forma segura en tu navegador y prevenir ataques de suplantación de identidad (CSRF). No utilizamos cookies de rastreo de terceros ni venta de perfiles publicitarios.
              </p>
            </div>
          </section>

          {/* 5. Derechos de Usuario */}
          <section className="space-y-3 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">05.</span> Tus Derechos sobre tus Datos
            </h2>
            <p>
              Conforme a la legislación vigente, tienes derecho a:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 pl-2">
              <li>Acceder en cualquier momento a tus datos personales desde la pestaña de Perfil.</li>
              <li>Rectificar o actualizar tu correo electrónico, contraseña o nombre visible.</li>
              <li>Eliminar o cancelar tu cuenta de usuario y todos los launchers asociados.</li>
              <li>Oponerte al tratamiento o solicitar la portabilidad de tus datos.</li>
            </ul>
          </section>

          {/* 6. Seguridad */}
          <section className="space-y-3 bg-[#121824] border border-[#1e2739] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">06.</span> Medidas de Seguridad Técnicas
            </h2>
            <p>
              Implementamos defensas de última generación que incluyen encriptación SSL/TLS de extremo a extremo, verificación criptográfica de sesiones, protección anti-SSRF, filtrado de rutas y rate limiting dinámico para salvaguardar tu información contra accesos no autorizados.
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
