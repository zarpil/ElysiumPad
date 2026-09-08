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
        setResendStatus('Nuevo correo enviado. Revisa tu bandeja de entrada.');
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
      <div className="min-h-screen bg-[#09090b] text-zinc-200 flex flex-col justify-center items-center p-6 font-sans">
        <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-200">
            <Mail className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-zinc-100">Verifica tu correo electrónico</h1>
            <p className="text-xs text-zinc-400">
              Hemos enviado un enlace de confirmación a:
            </p>
            <p className="text-xs font-mono font-semibold text-zinc-200 bg-zinc-900 px-3 py-1 rounded inline-block">
              {registeredEmail}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 text-left space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
              <span>Haz clic en el botón del correo para activar tu cuenta de inmediato.</span>
            </div>
            <div className="flex items-start gap-2 text-zinc-400">
              <span className="text-zinc-500">•</span>
              <span>Si no lo encuentras en unos minutos, revisa tu carpeta de Spam.</span>
            </div>
          </div>

          {resendStatus && (
            <div className="p-2.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg">
              {resendStatus}
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {resending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>Reenviar correo</span>
            </button>

            <Link
              href="/login"
              className="block text-xs text-zinc-400 hover:text-zinc-200 transition"
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
    <div className="min-h-screen bg-[#09090b] text-zinc-200 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 text-white">
            <img
              src="/logo.png"
              alt="ElysiumPad"
              className="w-7 h-7 rounded-lg object-contain"
            />
            <span className="font-bold text-sm tracking-tight text-zinc-100">ElysiumPad</span>
          </Link>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Crear Cuenta</h1>
          <p className="text-xs text-zinc-400">
            Regístrate para crear launchers para tus servidores
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Nombre / Apodo</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre o nick de Minecraft"
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Crear Cuenta'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-zinc-200 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
