"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, MessageCircle } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";

type Status = "loading" | "success" | "error";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-pink animate-spin" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const paypalOrderId = params.get("token");
  const via = params.get("via"); // "whatsapp" | null
  const { clear } = useCartStore();

  const [status, setStatus] = useState<Status>(via === "whatsapp" ? "success" : "loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // WhatsApp flow: cart already cleared in CheckoutClient, show success directly
    if (via === "whatsapp") return;

    if (!orderId || !paypalOrderId) {
      setStatus("error");
      setError("Parámetros de pago inválidos.");
      return;
    }

    // Capture the PayPal payment
    fetch("/api/checkout/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, paypalOrderId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          clear();
          setStatus("success");
        } else {
          setStatus("error");
          setError(data.error ?? "Error al confirmar el pago.");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Error de conexión al confirmar el pago.");
      });
  }, [orderId, paypalOrderId, via]);

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <a href="/" className="font-display text-2xl block">
          Beauty<span className="text-pink italic">Sale</span>
        </a>

        {status === "loading" && (
          <div className="rounded-[24px] bg-white border border-plum/5 p-10 space-y-4">
            <Loader2 className="h-12 w-12 text-pink animate-spin mx-auto" />
            <p className="font-display text-xl">Confirmando tu pago…</p>
            <p className="text-sm text-plum-soft">No cierres esta página.</p>
          </div>
        )}

        {status === "success" && via === "whatsapp" && (
          <div className="rounded-[24px] bg-white border border-[#25D366]/20 p-10 space-y-5">
            <div className="h-16 w-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto">
              <MessageCircle className="h-9 w-9 text-[#25D366]" />
            </div>
            <div>
              <h1 className="font-display text-3xl">¡Pedido registrado!</h1>
              <p className="text-plum-soft mt-2 text-sm">
                Se abrio WhatsApp con el resumen de tu pedido. Envialo para coordinar el pago con la tienda.
              </p>
            </div>
            {orderId && (
              <p className="text-xs text-plum-soft bg-plum/5 rounded-xl px-3 py-2">
                Pedido: <span className="font-mono">#{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
            )}
            <a
              href="/"
              className="block rounded-full bg-[#25D366] px-6 py-3 font-bold text-white hover:opacity-90 transition"
            >
              Seguir comprando
            </a>
          </div>
        )}

        {status === "success" && via !== "whatsapp" && (
          <div className="rounded-[24px] bg-white border border-plum/5 p-10 space-y-5">
            <CheckCircle className="h-16 w-16 text-mint mx-auto" />
            <div>
              <h1 className="font-display text-3xl">¡Gracias por tu compra!</h1>
              <p className="text-plum-soft mt-2 text-sm">
                Tu pedido fue confirmado. Recibirás un email con los detalles.
              </p>
            </div>
            {orderId && (
              <p className="text-xs text-plum-soft bg-plum/5 rounded-xl px-3 py-2">
                Orden: <span className="font-mono">{orderId}</span>
              </p>
            )}
            <a
              href="/"
              className="block rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
            >
              Seguir comprando
            </a>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-[24px] bg-white border border-pink/20 p-10 space-y-5">
            <div className="h-16 w-16 rounded-full bg-pink/10 flex items-center justify-center mx-auto">
              <span className="font-display text-4xl">!</span>
            </div>
            <div>
              <h1 className="font-display text-2xl">Algo salió mal</h1>
              <p className="text-plum-soft mt-2 text-sm">{error}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <a href="/" className="rounded-full border border-plum/15 px-5 py-2.5 text-sm font-semibold hover:bg-plum/5 transition">
                Volver al inicio
              </a>
              <a href="/checkout" className="rounded-full bg-pink px-5 py-2.5 text-sm font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition">
                Reintentar
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
