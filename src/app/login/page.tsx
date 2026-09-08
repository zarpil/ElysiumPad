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
        setSuccessMsg('¡Correo verificado con éxito! Tu cuenta está activa y lista para usar.');
      } else if (params.get('error') === 'token_invalid_or_expired') {
        setError('El enlace de verificación ha expirado o no es válido. Introduce tu correo para solicitar uno nuevo.');
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

      // Redirección completa para asegurar que la cookie sea leída por el navegador
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
        setResendStatus('¡Nuevo correo enviado! Revisa tu bandeja de entrada y la carpeta de spam.');
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
          <h1 className="text-xl font-bold text-white tracking-tight">Iniciar Sesión</h1>
          <p className="text-xs text-slate-400">
            Accede al panel de control de tus servidores
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isUnverified && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl space-y-2">
            <p className="font-semibold">¿No has recibido el correo de activación?</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Podemos enviarte un nuevo enlace a <strong>{unverifiedEmail}</strong>.
            </p>
            {resendStatus ? (
              <p className="text-[11px] text-emerald-400 font-medium">{resendStatus}</p>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Reenviar correo de verificación</span>
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-slate-300">Contraseña</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-emerald-400 hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#0c1017] border border-[#1e2739] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Entrar a Mi Panel'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1a2333]">
          <p className="text-xs text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-emerald-400 hover:underline font-medium">
              Crear cuenta gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
