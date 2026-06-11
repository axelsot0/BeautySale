"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { PLAN_PRICES, PRO_DISCOUNT_PCT, type Plan } from "@/lib/plans";

const field = "rounded-xl border border-plum/15 px-3 py-2.5 text-sm outline-none focus:border-pink";

const ERRORS: Record<string, string> = {
  promo_invalid: "Código promo inválido.",
  promo_used: "Ese código ya fue usado.",
  payments_not_configured: "Pagos online no disponibles todavía. Escribinos por WhatsApp.",
  paypal_error: "Error con PayPal. Intentá de nuevo.",
};

export function PayForm({ currentPlan }: { currentPlan: Plan }) {
  const [plan, setPlan] = useState<"basic" | "pro">(currentPlan === "basic" ? "basic" : "pro");
  const [months, setMonths] = useState(1);
  const [promo, setPromo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = PLAN_PRICES[plan];
  const promoApplies = plan === "pro" && promo.trim() !== "";
  const discount = promoApplies ? +(price * (PRO_DISCOUNT_PCT / 100)).toFixed(2) : 0;
  const total = +(price * months - discount).toFixed(2);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, months, promo: promo.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(ERRORS[data.error as string] ?? ERRORS.paypal_error);
        setLoading(false);
        return;
      }
      window.location.href = data.approveUrl;
    } catch {
      setError(ERRORS.paypal_error);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[24px] bg-white border border-plum/10 p-6 space-y-4">
      <h3 className="font-display text-xl">Pagar / renovar online</h3>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="block text-xs font-semibold text-plum-soft mb-1">Plan</span>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as "basic" | "pro")}
            className={field}
          >
            <option value="basic">Basic — ${PLAN_PRICES.basic}/mes</option>
            <option value="pro">Pro — ${PLAN_PRICES.pro}/mes</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-plum-soft mb-1">Meses</span>
          <input
            type="number"
            min={1}
            max={24}
            value={months}
            onChange={(e) => setMonths(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
            className={`${field} w-20`}
          />
        </label>
        {plan === "pro" && (
          <label className="block">
            <span className="block text-xs font-semibold text-plum-soft mb-1">
              Código promo (opcional)
            </span>
            <input
              type="text"
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
              placeholder="PRO30-XXXXXX"
              className={`${field} w-44 font-mono`}
            />
          </label>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-plum/5 px-5 py-3">
        <span className="text-sm text-plum-soft">
          Total
          {discount > 0 && (
            <span className="ml-2 text-mint font-semibold">-{PRO_DISCOUNT_PCT}% aplicado</span>
          )}
        </span>
        <span className="font-display text-2xl">${total.toFixed(2)}</span>
      </div>

      {error && (
        <p className="rounded-xl bg-pink/10 border border-pink/20 px-3 py-2 text-sm text-pink font-medium">
          {error}
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0070BA] py-3 font-bold text-white hover:opacity-90 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Pagar con PayPal o tarjeta
      </button>
      <p className="text-xs text-plum-soft text-center">
        Aceptamos PayPal y tarjetas de crédito/débito (checkout seguro de PayPal).
      </p>
    </div>
  );
}
