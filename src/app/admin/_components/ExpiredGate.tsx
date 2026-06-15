"use client";

import { Crown, Check, Lock } from "lucide-react";
import { PLAN_PRICES, PLAN_LABELS, PLAN_PERKS } from "@/lib/plans";
import type { Plan } from "@/lib/plans";

// Pantalla que reemplaza el panel cuando el demo/plan venció. Muestra los
// planes con beneficios y un botón de comprar que lleva al checkout (/suscribir).
export function ExpiredGate({ currentPlan }: { currentPlan: Plan }) {
  const wasDemo = currentPlan === "demo";
  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      <div className="rounded-[28px] bg-plum text-cream p-8 md:p-10 text-center space-y-3">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream/10">
          <Lock className="h-7 w-7 text-butter" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl">
          {wasDemo ? "Tu prueba terminó" : "Tu plan venció"}
        </h1>
        <p className="text-cream/75 max-w-md mx-auto">
          Tu tienda está pausada. Elegí un plan para reactivarla — tus productos,
          pedidos y diseño siguen guardados.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(["basic", "pro"] as const).map((p) => (
          <div
            key={p}
            className={`rounded-[24px] p-6 space-y-4 border ${
              p === "pro" ? "bg-pink/5 border-pink" : "bg-white border-plum/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl flex items-center gap-1.5">
                {p === "pro" && <Crown className="h-5 w-5 text-butter" />}
                {PLAN_LABELS[p]}
              </h2>
              {p === "pro" && (
                <span className="rounded-full bg-pink text-cream px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  Popular
                </span>
              )}
            </div>
            <p className="font-display text-4xl">
              ${PLAN_PRICES[p]}
              <span className="text-sm text-plum-soft font-sans"> /mes</span>
            </p>
            <ul className="space-y-1.5 text-sm">
              {PLAN_PERKS[p].map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-pink shrink-0" /> {perk}
                </li>
              ))}
            </ul>
            <a
              href={`/suscribir?plan=${p}`}
              className="block text-center rounded-full bg-pink px-6 py-3 font-bold text-cream hover:opacity-90 transition"
            >
              Comprar {PLAN_LABELS[p]}
            </a>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-plum-soft">
        ¿Preferís transferencia? También podés pagar por WhatsApp desde el checkout.
      </p>
    </div>
  );
}
