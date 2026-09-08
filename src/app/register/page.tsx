'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, User, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para verificación de correo requerida
  const [requireVerification, setRequireVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al registrarse');
      }

      // Si la cuenta requiere verificación por mail
      if (data.requireVerification) {
        setRegisteredEmail(data.email || email);
        setRequireVerification(true);
        setLoading(false);
        return;
      }

      // Si es el primer usuario admin verificado automáticamente
      window.location.href = data.user?.role === 'ADMIN' ? '/admin' : '/dashboard';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleResendEmail() {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setResendStatus('¡Nuevo correo enviado! Revisa tu bandeja de entrada.');
      } else {
        setResendStatus(data.error || 'No se pudo reenviar el correo.');
      }
    } catch {
      setResendStatus('Error de conexión al reenviar el correo.');
    } finally {
      setResending(false);
    }
  }

  // Pantalla de Confirmación de Verificación de Email
  if (requireVerification) {
    return (
      <div className="min-h-screen bg-[#0c1017] text-slate-200 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md bg-[#121824] border border-[#1e2739] rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
            <Mail className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">¡Casi listo!</h1>
            <h2 className="text-base font-semibold text-emerald-400">Verifica tu correo electrónico</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hemos enviado un enlace de confirmación a:
            </p>
            <div className="inline-block px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white font-bold">
              {registeredEmail}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 text-left space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Haz clic en el botón del correo para activar tu cuenta al instante.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
              <span className="text-slate-400">Si no lo ves en unos minutos, revisa tu carpeta de <strong>Correo no deseado (Spam)</strong>.</span>
            </div>
          </div>

          {resendStatus && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl">
              {resendStatus}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {resending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>¿No te ha llegado? Reenviar correo</span>
            </button>

            <Link
              href="/login"
              className="block text-xs text-slate-400 hover:text-white transition font-medium"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de Registro Estándar
  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-200 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm bg-[#121824] border border-[#1e2739] rounded-xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 text-white group">
            <img
              src="/logo.png"
              alt="ElysiumPad"
              className="w-8 h-8 rounded-lg object-contain shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition">ElysiumPad</span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Crear Cuenta</h1>
          <p className="text-xs text-slate-400">
            Regístrate para crear launchers para tu servidor
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">Nombre / Apodo</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre o nick de Minecraft"
                className="w-full pl-9 pr-3 py-2 bg-[#0c1017] border border-[#1e2739] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-9 pr-3 py-2 bg-[#0c1017] border border-[#1e2739] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-3 py-2 bg-[#0c1017] border border-[#1e2739] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Crear Mi Cuenta Gratis'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1a2333]">
          <p className="text-xs text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-emerald-400 hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
