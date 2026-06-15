"use client";

import { useState } from "react";
import { Loader2, CreditCard, MessageCircle, Lock } from "lucide-react";
import { PLAN_PRICES, PRO_DISCOUNT_PCT } from "@/lib/plans";

const field =
  "w-full rounded-xl border border-plum/15 px-3.5 py-2.5 text-sm outline-none focus:border-pink transition disabled:bg-plum/5 disabled:text-plum-soft";
const labelCls = "block text-xs font-semibold text-plum-soft uppercase tracking-wider mb-1";

const ERRORS: Record<string, string> = {
  promo_invalid: "Código promo inválido.",
  promo_used: "Ese código ya fue usado.",
  payments_not_configured: "Pagos online no disponibles. Usá WhatsApp.",
  paypal_error: "Error con PayPal. Intentá de nuevo.",
  invalid_input: "Revisá los datos del formulario.",
  db_error: "No pudimos registrar la solicitud. Intentá de nuevo.",
};

export function SubscribeCheckout({
  plan: initialPlan,
  months: initialMonths,
  loggedIn,
  email: initialEmail,
  storeName: initialStore,
  paymentsEnabled,
}: {
  plan: "basic" | "pro";
  months: number;
  loggedIn: boolean;
  email: string;
  storeName: string;
  paymentsEnabled: boolean;
}) {
  const [months, setMonths] = useState(initialMonths);
  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [email, setEmail] = useState(initialEmail);
  const [storeName, setStoreName] = useState(initialStore);
  const [loading, setLoading] = useState<null | "paypal" | "whatsapp">(null);
  const [error, setError] = useState<string | null>(null);

  const price = PLAN_PRICES[initialPlan];
  // El descuento solo cuenta cuando el código fue validado contra la DB.
  const promoApplies = initialPlan === "pro" && promoState === "valid";
  const discount = promoApplies ? +(price * (PRO_DISCOUNT_PCT / 100)).toFixed(2) : 0;
  const total = +(price * months - discount).toFixed(2);

  async function applyPromo() {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    setPromoState("checking");
    try {
      const res = await fetch("/api/subscription/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setPromoState(data.valid ? "valid" : "invalid");
    } catch {
      setPromoState("invalid");
    }
  }

  const formReady = email.trim() !== "" && storeName.trim() !== "";

  async function payWithPayPal() {
    setError(null);
    // Sin sesión: hay que crear cuenta primero (PayPal activa una tienda concreta).
    if (!loggedIn) {
      const next = `/suscribir?plan=${initialPlan}&months=${months}`;
      window.location.href = `/signup?next=${encodeURIComponent(next)}`;
      return;
    }
    setLoading("paypal");
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: initialPlan, months, promo: promoApplies ? promo.trim() : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(ERRORS[data.error as string] ?? ERRORS.paypal_error);
        setLoading(null);
        return;
      }
      window.location.href = data.approveUrl;
    } catch {
      setError(ERRORS.paypal_error);
      setLoading(null);
    }
  }

  async function payByTransfer() {
    setError(null);
    if (!formReady) {
      setError("Completá tu email y el nombre de la tienda.");
      return;
    }
    setLoading("whatsapp");
    try {
      const res = await fetch("/api/subscription/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: initialPlan,
          months,
          email: email.trim(),
          store_name: storeName.trim(),
          promo: promoApplies ? promo.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(ERRORS[data.error as string] ?? ERRORS.db_error);
        setLoading(null);
        return;
      }
      window.location.href = data.waUrl;
    } catch {
      setError(ERRORS.db_error);
      setLoading(null);
    }
  }

  return (
    <section className="rounded-[28px] bg-white border border-plum/10 p-6 md:p-8 space-y-5 h-fit">
      <h2 className="font-display text-2xl">Tus datos</h2>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loggedIn}
            placeholder="vos@ejemplo.com"
            className={field}
          />
        </div>
        <div>
          <label className={labelCls}>Nombre de la tienda</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            disabled={loggedIn}
            maxLength={100}
            placeholder="Glow Beauty"
            className={field}
          />
        </div>
        {loggedIn && (
          <p className="flex items-center gap-1.5 text-xs text-plum-soft">
            <Lock className="h-3 w-3" /> Tomados de tu cuenta.
          </p>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className={labelCls}>Meses</span>
            <input
              type="number"
              min={1}
              max={24}
              value={months}
              onChange={(e) => setMonths(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
              className={`${field} w-24`}
            />
          </label>
          {initialPlan === "pro" && (
            <label className="block flex-1 min-w-[12rem]">
              <span className={labelCls}>Código promo (opcional)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value.toUpperCase());
                    setPromoState("idle");
                  }}
                  placeholder="PRO30-XXXXXX"
                  className={`${field} font-mono`}
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={promo.trim() === "" || promoState === "checking"}
                  className="shrink-0 rounded-xl bg-plum px-4 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
                >
                  {promoState === "checking" ? "..." : "Aplicar"}
                </button>
              </div>
              {promoState === "valid" && (
                <span className="mt-1 block text-xs font-semibold text-mint">
                  Código válido · -{PRO_DISCOUNT_PCT}% aplicado
                </span>
              )}
              {promoState === "invalid" && (
                <span className="mt-1 block text-xs font-semibold text-pink">
                  Código inválido o ya usado.
                </span>
              )}
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-plum/5 px-5 py-3">
        <span className="text-sm text-plum-soft">
          Total
          {discount > 0 && (
            <span className="ml-2 text-mint font-semibold">-{PRO_DISCOUNT_PCT}% aplicado</span>
          )}
        </span>
        <span className="font-display text-2xl">${total.toFixed(2)} USD</span>
      </div>

      {error && (
        <p className="rounded-xl bg-pink/10 border border-pink/20 px-3 py-2 text-sm text-pink font-medium">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {paymentsEnabled && (
          <button
            onClick={payWithPayPal}
            disabled={loading !== null}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0070BA] py-3.5 font-bold text-white hover:opacity-90 disabled:opacity-60 transition"
          >
            {loading === "paypal" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {loggedIn ? "Pagar con PayPal o tarjeta" : "Pagar con PayPal (crear cuenta)"}
          </button>
        )}

        <button
          onClick={payByTransfer}
          disabled={loading !== null}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-bold text-white hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading === "whatsapp" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
          Transferencia por WhatsApp
        </button>
      </div>

      <p className="text-xs text-plum-soft text-center leading-relaxed">
        {!loggedIn && (
          <>
            Para pagar con PayPal primero creás tu cuenta (tienda demo) y luego activás el plan.
            <br />
          </>
        )}
        La transferencia abre WhatsApp con el dueño; tu tienda se activa al confirmar el pago.
      </p>
    </section>
  );
}
