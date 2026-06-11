"use client";

import { useActionState } from "react";
import { MessageCircle, Loader2, Check } from "lucide-react";
import { saveWhatsappCheckout } from "./actions";
import type { SettingsState } from "./actions";

const INIT: SettingsState = {};

export function WhatsAppCheckoutForm({ currentNumber }: { currentNumber: string }) {
  const [state, action, pending] = useActionState(saveWhatsappCheckout, INIT);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-plum-soft uppercase tracking-wider">
          Numero de WhatsApp
        </label>
        <div className="flex gap-2 items-center">
          <span className="text-plum-soft shrink-0">
            <MessageCircle className="h-4 w-4" />
          </span>
          <input
            name="whatsapp_checkout"
            type="tel"
            defaultValue={currentNumber}
            placeholder="+18095551234"
            className="flex-1 rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink"
          />
        </div>
        <p className="text-xs text-plum/40">
          Formato internacional con +. Ej: +18095551234 (RD) o +5491155556666 (AR).
          Dejalo en blanco para desactivar el boton de WhatsApp en checkout.
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-pink font-medium">{state.error}</p>
      )}
      {state.ok && (
        <p className="flex items-center gap-1.5 text-sm text-mint font-medium">
          <Check className="h-4 w-4" /> Guardado
        </p>
      )}

      <button
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-5 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
        Guardar numero de WhatsApp
      </button>
    </form>
  );
}
