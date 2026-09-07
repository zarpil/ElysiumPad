'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Crown, Zap, Shield, ArrowRight, Loader2, X } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPlan: string;
}

export function UpgradeModal({ isOpen, onClose, onSuccess, currentPlan }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'LIFETIME'>('PRO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cupones de descuento
  const [couponInput, setCouponInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    description?: string | null;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/billing/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput }),
      });

      const data = await res.json();
      if (data.success && data.valid) {
        setAppliedCoupon(data.coupon);
        setCouponInput('');
      } else {
        setCouponError(data.error || 'Cupón inválido o caducado.');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Error al validar el cupón.');
    } finally {
      setValidatingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError(null);
  }

  // Precios base
  const baseProPrice = 4.99;
  const baseLifetimePrice = 49.0;

  const discountMultiplier = appliedCoupon ? (100 - appliedCoupon.discountPercent) / 100 : 1;
  const finalProPrice = (baseProPrice * discountMultiplier).toFixed(2);
  const finalLifetimePrice = (baseLifetimePrice * discountMultiplier).toFixed(2);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Error al procesar la actualización');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Potencia tu Servidor de Minecraft
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Desbloquea Todas las Funciones PRO
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Sube tus propios mods .jar, personaliza el launcher sin marcas de agua y crea servidores ilimitados.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Plan Cards Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option PRO */}
          <div
            onClick={() => setSelectedPlan('PRO')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
              selectedPlan === 'PRO'
                ? 'bg-emerald-950/20 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Plan PRO
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold">
                  Suscripción
                </span>
              </div>
              <div>
                {appliedCoupon ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-emerald-400">
                      ${finalProPrice} <span className="text-xs font-normal text-slate-400">/mes</span>
                    </p>
                    <p className="text-sm font-semibold text-slate-500 line-through">$4.99</p>
                  </div>
                ) : (
                  <p className="text-2xl font-black text-white">
                    $4.99 <span className="text-xs font-normal text-slate-400">/mes</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">Cancela en cualquier momento.</p>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300 pt-3 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Slug URL personalizado (ej: /d/mi-servidor)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Launchers ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Subida de mods .jar y configs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% White-Label (Sin marcas)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Option LIFETIME */}
          <div
            onClick={() => setSelectedPlan('LIFETIME')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
              selectedPlan === 'LIFETIME'
                ? 'bg-amber-950/20 border-amber-500 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  LIFETIME
                </span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Acceso De Por Vida
                </span>
              </div>
              <div>
                {appliedCoupon ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-amber-400">
                      ${finalLifetimePrice} <span className="text-xs font-normal text-slate-400">pago único</span>
                    </p>
                    <p className="text-sm font-semibold text-slate-500 line-through">$49</p>
                  </div>
                ) : (
                  <p className="text-2xl font-black text-white">
                    $49 <span className="text-xs font-normal text-slate-400">pago único</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">Todas las funciones PRO para siempre.</p>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300 pt-3 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Slug URL personalizado para siempre</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sin pagos mensuales recurrentes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Insignia VIP Fundador</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Soporte prioritario 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Promo / Discount Coupon Section */}
        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </span>
                <div>
                  <span className="font-bold text-white font-mono">{appliedCoupon.code}</span>
                  <span className="text-emerald-400 font-bold ml-1.5">
                    (-{appliedCoupon.discountPercent}% aplicado)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-slate-400 hover:text-rose-400 transition underline font-medium"
              >
                Quitar cupón
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="¿Tienes un cupón de descuento?"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  if (couponError) setCouponError(null);
                }}
                className="flex-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-white uppercase placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={validatingCoupon || !couponInput.trim()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                {validatingCoupon ? 'Validando...' : 'Aplicar'}
              </button>
            </form>
          )}

          {couponError && (
            <p className="text-[11px] text-rose-400 mt-2 font-medium">{couponError}</p>
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <p className="text-[11px] text-slate-400">
            Activación inmediata • Soporte garantizado
          </p>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activando plan...</span>
              </>
            ) : (
              <>
                <span>
                  Activar {selectedPlan} {appliedCoupon && `($${selectedPlan === 'PRO' ? finalProPrice : finalLifetimePrice})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
