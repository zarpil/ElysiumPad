'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Mail, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado de cuenta no verificada
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verified') === 'true') {
        setSuccessMsg('Correo verificado con éxito. Tu cuenta está activa y lista.');
      } else if (params.get('error') === 'token_invalid_or_expired') {
        setError('El enlace de verificación ha expirado o no es válido.');
      } else if (params.get('error') === 'token_missing') {
        setError('Enlace de verificación incompleto.');
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsUnverified(false);
    setResendStatus(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        if (data.unverified) {
          setIsUnverified(true);
          setUnverifiedEmail(data.email || email);
        }
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect');
      const target = redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : (data.user?.role === 'ADMIN' ? '/admin' : '/dashboard');
      window.location.href = target;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail || email }),
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
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Iniciar Sesión</h1>
          <p className="text-xs text-zinc-400">
            Accede al panel de control de tus servidores
          </p>
        </div>

        {successMsg && (
          <div className="p-2.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-2.5 bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isUnverified && (
          <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg space-y-2">
            <p className="font-semibold text-zinc-100">¿No has recibido el correo de activación?</p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Podemos enviarte un nuevo enlace a <strong>{unverifiedEmail}</strong>.
            </p>
            {resendStatus ? (
              <p className="text-[11px] text-zinc-200 font-medium">{resendStatus}</p>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Reenviar correo de activación</span>
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-zinc-300">Contraseña</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-zinc-400 hover:text-zinc-200 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Entrar'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-400">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-zinc-200 hover:underline font-medium">
              Crear cuenta gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
