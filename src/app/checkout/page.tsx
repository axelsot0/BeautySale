"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import { Loader2, ShoppingBag } from "lucide-react";

interface FormData {
  customer_name: string;
  customer_email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const EMPTY: FormData = {
  customer_name: "",
  customer_email: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "Argentina",
};

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCartStore();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          shipping_address: {
            street: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
          },
          items: items.map((i) => ({
            id: i.id,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al procesar el pedido");
        return;
      }

      // Redirect to PayPal approval
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        setError("No se recibió URL de pago");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16 text-plum/20" />
        <h1 className="font-display text-3xl">Tu carrito está vacío</h1>
        <a href="/" className="rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition">
          Volver al inicio
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <a href="/" className="font-display text-2xl">
            Beauty<span className="text-pink italic">Sale</span>
          </a>
          <h1 className="font-display text-4xl mt-4">Checkout</h1>
        </header>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── Left: form ── */}
          <div className="space-y-6">

            {/* Contact */}
            <section className="rounded-[24px] bg-white border border-plum/5 p-6 space-y-4">
              <h2 className="font-display text-xl">Datos de contacto</h2>

              <label className="block">
                <span className="field-label">Nombre completo</span>
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
            </section>

            {/* Shipping */}
            <section className="rounded-[24px] bg-white border border-plum/5 p-6 space-y-4">
              <h2 className="font-display text-xl">Dirección de envío</h2>

              <label className="block">
                <span className="field-label">Calle y número</span>
                <input
                  type="text"
                  required
                  value={form.street}
                  onChange={(e) => update("street", e.target.value)}
                  placeholder="Av. Corrientes 1234, Piso 3"
                  className="field-input"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="field-label">Ciudad</span>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Buenos Aires"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Provincia / Estado</span>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="CABA"
                    className="field-input"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="field-label">Código postal</span>
                  <input
                    type="text"
                    value={form.zip}
                    onChange={(e) => update("zip", e.target.value)}
                    placeholder="1043"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">País</span>
                  <input
                    type="text"
                    required
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    placeholder="Argentina"
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
            <h2 className="font-display text-xl">Resumen del pedido</h2>

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

            <div className="border-t border-plum/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-plum-soft">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-plum-soft">Envío</span>
                <span className="font-semibold text-mint">A calcular</span>
              </div>
              <div className="flex justify-between text-lg font-display pt-2 border-t border-plum/10">
                <span>Total</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-pink py-3.5 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                "Pagar con PayPal →"
              )}
            </button>

            <p className="text-xs text-center text-plum-soft">
              Serás redirigido a PayPal para completar el pago de forma segura.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
