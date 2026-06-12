"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import { getDict, readClientLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { Loader2, ShoppingBag, Check, Tag, MessageCircle } from "lucide-react";

interface FormFields {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const EMPTY: FormFields = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "República Dominicana",
};

export function CheckoutClient({
  waNumber,
  siteName,
}: {
  waNumber: string;
  siteName: string;
}) {
  const { items, subtotal, clear } = useCartStore();
  const [form, setForm] = useState<FormFields>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [waLoading, setWaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; percent: number } | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => setLocale(readClientLocale()), []);
  const t = getDict(locale);

  function update(field: keyof FormFields, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const sub = subtotal();
  const discount = applied ? parseFloat((sub * (applied.percent / 100)).toFixed(2)) : 0;
  const total = parseFloat((sub - discount).toFixed(2));

  const CODE_ERRORS: Record<string, string> = {
    not_found: t.co_err_code,
    used: t.co_err_code_used,
    invalid: t.co_err_code,
  };

  async function applyCode() {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setValidating(true);
    setCodeError(null);
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data = await res.json();
      if (data.valid) {
        setApplied({ code: c, percent: data.percent });
      } else {
        setApplied(null);
        setCodeError(CODE_ERRORS[data.error] ?? "Código inválido");
      }
    } catch {
      setCodeError("Error al validar. Intentá de nuevo.");
    } finally {
      setValidating(false);
    }
  }

  function removeCode() {
    setApplied(null);
    setCode("");
    setCodeError(null);
  }

  function buildPayload() {
    return {
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone || undefined,
      shipping_address: {
        street: form.street,
        city: form.city,
        state: form.state || undefined,
        zip: form.zip || undefined,
        country: form.country,
      },
      items: items.map((i) => ({
        id: i.id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      discount_code: applied?.code,
    };
  }

  // ── PayPal ──────────────────────────────────────────────────────────────────

  async function handlePayPal(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t.co_err_order);
        return;
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        setError(t.co_err_no_url);
      }
    } catch {
      setError(t.co_err_conn);
    } finally {
      setLoading(false);
    }
  }

  // ── WhatsApp ────────────────────────────────────────────────────────────────

  async function handleWhatsApp() {
    if (items.length === 0) return;
    setWaLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), store_name: siteName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t.co_err_order);
        return;
      }

      // Clear cart, redirect to wa.me (same tab — no popup blocking)
      // Mobile: opens WhatsApp app. Desktop: opens web.whatsapp.com
      clear();
      window.location.href = data.waUrl;
    } catch {
      setError(t.co_err_conn);
    } finally {
      setWaLoading(false);
    }
  }

  // ── Empty cart ──────────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16 text-plum/20" />
        <h1 className="font-display text-3xl">{t.cart_empty}</h1>
        <a href="/" className="rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition">
          {t.back_home}
        </a>
      </main>
    );
  }

  const anyLoading = loading || waLoading;

  return (
    <main className="min-h-screen bg-cream py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <a href="/" className="font-display text-2xl">
            {siteName}
          </a>
          <h1 className="font-display text-4xl mt-4">Checkout</h1>
        </header>

        <form onSubmit={handlePayPal} className="grid md:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── Left: form ── */}
          <div className="space-y-6">

            {/* Contact */}
            <section className="rounded-[24px] bg-white border border-plum/5 p-6 space-y-4">
              <h2 className="font-display text-xl">{t.co_contact}</h2>

              <label className="block">
                <span className="field-label">{t.co_name}</span>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) => update("customer_name", e.target.value)}
                  placeholder="María González"
                  className="field-input"
                />
              </label>

              <label className="block">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  required
                  value={form.customer_email}
                  onChange={(e) => update("customer_email", e.target.value)}
                  placeholder="maria@ejemplo.com"
                  className="field-input"
                />
              </label>

              <label className="block">
                <span className="field-label">{t.co_phone} <span className="text-plum/30 font-normal">{t.co_optional}</span></span>
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => update("customer_phone", e.target.value)}
                  placeholder="+18095551234"
                  className="field-input"
                />
              </label>
            </section>

            {/* Shipping */}
            <section className="rounded-[24px] bg-white border border-plum/5 p-6 space-y-4">
              <h2 className="font-display text-xl">{t.co_shipping}</h2>

              <label className="block">
                <span className="field-label">{t.co_street}</span>
                <input
                  type="text"
                  required
                  value={form.street}
                  onChange={(e) => update("street", e.target.value)}
                  placeholder="Calle Primera #45, Piantini"
                  className="field-input"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="field-label">{t.co_city}</span>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Santo Domingo"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">{t.co_state}</span>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="Distrito Nacional"
                    className="field-input"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="field-label">{t.co_zip}</span>
                  <input
                    type="text"
                    value={form.zip}
                    onChange={(e) => update("zip", e.target.value)}
                    placeholder="10101"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">{t.co_country}</span>
                  <input
                    type="text"
                    required
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    placeholder="República Dominicana"
                    className="field-input"
                  />
                </label>
              </div>
            </section>

            {error && (
              <p className="rounded-2xl bg-pink/10 border border-pink/20 px-4 py-3 text-sm text-pink font-medium">
                {error}
              </p>
            )}
          </div>

          {/* ── Right: order summary ── */}
          <div className="rounded-[24px] bg-white border border-plum/5 p-6 space-y-4 sticky top-24">
            <h2 className="font-display text-xl">{t.co_summary}</h2>

            <ul className="divide-y divide-plum/5 space-y-0">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-lavender/20 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-plum-soft text-xs">x{item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            {/* Discount code */}
            <div className="border-t border-plum/10 pt-4">
              {applied ? (
                <div className="flex items-center justify-between rounded-2xl bg-mint/15 border border-mint/30 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-plum">
                    <Check className="h-4 w-4 text-mint" />
                    {applied.code} ({applied.percent}% off)
                  </span>
                  <button
                    type="button"
                    onClick={removeCode}
                    className="text-xs font-semibold text-plum-soft hover:text-pink"
                  >
                    {t.remove}
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="field-label flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> {t.co_discount_code}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setCodeError(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCode(); } }}
                      placeholder="GLOW-XXXXXX"
                      className="field-input flex-1 uppercase"
                    />
                    <button
                      type="button"
                      onClick={applyCode}
                      disabled={validating || !code.trim()}
                      className="rounded-full bg-plum px-4 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
                    >
                      {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : t.co_apply}
                    </button>
                  </div>
                  {codeError && <p className="text-xs text-pink font-medium">{codeError}</p>}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-plum/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-plum-soft">{t.subtotal}</span>
                <span className="font-semibold">{formatPrice(sub)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-plum-soft">{t.co_discount} ({applied?.percent}%)</span>
                  <span className="font-semibold text-mint">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-plum-soft">{t.co_shipping}</span>
                <span className="font-semibold text-mint">{t.co_shipping_calc}</span>
              </div>
              <div className="flex justify-between text-lg font-display pt-2 border-t border-plum/10">
                <span>{t.co_total}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Payment buttons */}
            <div className="space-y-3 pt-1">
              {/* PayPal */}
              <button
                type="submit"
                disabled={anyLoading}
                className="w-full rounded-full bg-pink py-3.5 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] disabled:opacity-60 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />{t.co_processing}</>
                ) : (
                  t.co_pay_paypal
                )}
              </button>

              {/* WhatsApp — only if configured */}
              {waNumber && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-plum/10" />
                    <span className="text-xs text-plum/30">{t.co_or}</span>
                    <div className="flex-1 h-px bg-plum/10" />
                  </div>
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    disabled={anyLoading}
                    className="w-full rounded-full bg-[#25D366] py-3.5 font-bold text-white hover:shadow-[0_0_24px_rgba(37,211,102,0.4)] disabled:opacity-60 transition flex items-center justify-center gap-2"
                  >
                    {waLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />{t.co_processing}</>
                    ) : (
                      <><MessageCircle className="h-5 w-5" />{t.co_pay_wa}</>
                    )}
                  </button>
                  <p className="text-xs text-center text-plum-soft">{t.co_wa_note}</p>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
