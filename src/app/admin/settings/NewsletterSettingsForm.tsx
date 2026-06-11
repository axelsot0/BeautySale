"use client";

import { useActionState } from "react";
import { Loader2, Check, Mail } from "lucide-react";
import { saveNewsletterSettings, type SettingsState } from "./actions";
import type { NewsletterConfig } from "@/lib/data/theme-query";

const field = "w-full rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink";
const INITIAL: SettingsState = {};

export function NewsletterSettingsForm({ config }: { config: NewsletterConfig }) {
  const [state, action, pending] = useActionState(saveNewsletterSettings, INITIAL);

  return (
    <section id="newsletter" className="rounded-3xl border border-plum/10 bg-white p-6 space-y-4">
      <h2 className="font-display text-2xl flex items-center gap-2">
        <Mail className="h-5 w-5 text-pink" /> Newsletter
      </h2>
      <p className="text-sm text-plum-soft">
        Texto y descuento del bloque de suscripción. Aparece en el footer y en cualquier
        sección de newsletter que agregues en Diseño.
      </p>
      <form action={action} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-plum-soft">Título</span>
          <input name="newsletter_title" defaultValue={config.title} maxLength={80} className={field} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-plum-soft">Subtítulo / descripción</span>
          <textarea
            name="newsletter_subtitle"
            defaultValue={config.subtitle}
            maxLength={200}
            rows={2}
            className={`${field} resize-none`}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-plum-soft">% de descuento</span>
          <input
            type="number"
            name="newsletter_discount_pct"
            defaultValue={config.discountPct}
            min={1}
            max={100}
            className={`${field} max-w-[140px]`}
          />
          <span className="text-xs text-plum-soft ml-1">
            El código que reciben los suscriptores dará este % off.
          </span>
        </label>
        <div className="flex gap-3 items-center flex-wrap">
          <button
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
          </button>
          {state.ok && (
            <span className="text-sm text-mint flex items-center gap-1">
              <Check className="h-4 w-4" /> Guardado
            </span>
          )}
          {state.error && <span className="text-sm text-pink">{state.error}</span>}
        </div>
      </form>
    </section>
  );
}
