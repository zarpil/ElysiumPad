'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Crown, Loader2, X, ArrowRight } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-zinc-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-left space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-700">
            <Sparkles className="w-3 h-3" /> ElysiumPad Pro & Lifetime
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Planes y Funciones Avanzadas
          </h2>
          <p className="text-xs text-zinc-400">
            Sube tus propios mods .jar, personaliza el launcher sin marcas de agua y crea servidores ilimitados.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-zinc-950 border border-red-800/60 text-red-300 text-xs rounded-lg text-left">
            {error}
          </div>
        )}

        {/* Plan Cards Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option PRO */}
          <div
            onClick={() => setSelectedPlan('PRO')}
            className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              selectedPlan === 'PRO'
                ? 'bg-zinc-950 border-white text-white'
                : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Plan PRO
                </span>
                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px] font-medium border border-zinc-700">
                  Mensual
                </span>
              </div>
              <div>
                {appliedCoupon ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold text-white">
                      ${finalProPrice} <span className="text-xs font-normal text-zinc-400">/mes</span>
                    </p>
                    <p className="text-xs font-medium text-zinc-500 line-through">$4.99</p>
                  </div>
                ) : (
                  <p className="text-xl font-bold text-white">
                    $4.99 <span className="text-xs font-normal text-zinc-400">/mes</span>
                  </p>
                )}
                <p className="text-[11px] text-zinc-500 mt-0.5">Cancela en cualquier momento.</p>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-300 pt-3 border-t border-zinc-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Slug URL personalizado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Launchers ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Subida de .jar y configs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>100% Sin publicidad</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Option LIFETIME */}
          <div
            onClick={() => setSelectedPlan('LIFETIME')}
            className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              selectedPlan === 'LIFETIME'
                ? 'bg-zinc-950 border-white text-white'
                : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  LIFETIME
                </span>
                <span className="px-2 py-0.5 bg-amber-950/50 text-amber-300 rounded text-[10px] font-medium border border-amber-800/60 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Vitalicio
                </span>
              </div>
              <div>
                {appliedCoupon ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold text-white">
                      ${finalLifetimePrice} <span className="text-xs font-normal text-zinc-400">pago único</span>
                    </p>
                    <p className="text-xs font-medium text-zinc-500 line-through">$49</p>
                  </div>
                ) : (
                  <p className="text-xl font-bold text-white">
                    $49 <span className="text-xs font-normal text-zinc-400">pago único</span>
                  </p>
                )}
                <p className="text-[11px] text-zinc-500 mt-0.5">Todas las funciones PRO para siempre.</p>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-300 pt-3 border-t border-zinc-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Slug permanente garantizado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sin cuotas mensuales</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Insignia Fundador</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Soporte prioritario</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Promo / Discount Coupon Section */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-[11px]">
                  ✓
                </span>
                <div>
                  <span className="font-semibold text-white font-mono">{appliedCoupon.code}</span>
                  <span className="text-zinc-400 ml-1.5">
                    (-{appliedCoupon.discountPercent}% aplicado)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-zinc-400 hover:text-red-400 transition underline font-medium"
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
                className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs text-white uppercase placeholder-zinc-500 font-mono tracking-wider focus:outline-none focus:border-zinc-600"
              />
              <button
                type="submit"
                disabled={validatingCoupon || !couponInput.trim()}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
              >
                {validatingCoupon ? 'Validando...' : 'Aplicar'}
              </button>
            </form>
          )}

          {couponError && (
            <p className="text-[11px] text-red-400 mt-2 font-medium">{couponError}</p>
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-500">
            Activación inmediata • Facturación segura
          </p>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition flex items-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Activando plan...</span>
              </>
            ) : (
              <>
                <span>
                  Activar {selectedPlan} {appliedCoupon && `($${selectedPlan === 'PRO' ? finalProPrice : finalLifetimePrice})`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
