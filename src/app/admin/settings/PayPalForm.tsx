"use client";

import { useActionState, useRef } from "react";
import { Check, Loader2, CreditCard, Trash2 } from "lucide-react";
import { savePayPal, type SettingsState } from "./actions";

const INITIAL: SettingsState = {};

export function PayPalForm({
  clientId,
  mode,
  hasSecret,
}: {
  clientId: string;
  mode: "sandbox" | "live";
  hasSecret: boolean;
}) {
  const [state, action, pending] = useActionState(savePayPal, INITIAL);
  const clearRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="rounded-3xl border border-plum/10 bg-white p-6 space-y-5">
      <div className="flex items-center gap-2 text-plum">
        <CreditCard className="h-5 w-5" />
        <h2 className="font-display text-2xl">PayPal Business</h2>
      </div>

      <input ref={clearRef} type="hidden" name="clear" value="false" />

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-plum">Client ID</label>
        <input
          name="paypal_client_id"
          defaultValue={clientId}
          placeholder="AeA1QIZ..."
          className="w-full rounded-xl border border-plum/15 px-4 py-2.5 text-sm font-mono focus:border-pink outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-plum">Secret</label>
        <input
          name="paypal_secret"
          type="password"
          autoComplete="new-password"
          placeholder={hasSecret ? "(guardado - dejá vacío para conservar)" : "Secret de la app"}
          className="w-full rounded-xl border border-plum/15 px-4 py-2.5 text-sm font-mono focus:border-pink outline-none"
        />
        <p className="text-xs text-plum-soft">
          Encontralos en developer.paypal.com → Apps &amp; Credentials → sección Live.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-plum">Modo</label>
        <select
          name="paypal_mode"
          defaultValue={mode}
          className="w-full rounded-xl border border-plum/15 px-4 py-2.5 text-sm focus:border-pink outline-none"
        >
          <option value="sandbox">Sandbox (pruebas)</option>
          <option value="live">Live (cobros reales)</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && (
        <p className="flex items-center gap-1.5 text-sm text-green-700">
          <Check className="h-4 w-4" /> Guardado
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          onClick={() => clearRef.current && (clearRef.current.value = "false")}
          className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar
        </button>
        {(clientId || hasSecret) && (
          <button
            type="submit"
            disabled={pending}
            onClick={() => clearRef.current && (clearRef.current.value = "true")}
            className="inline-flex items-center gap-2 rounded-full border border-plum/15 px-6 py-2.5 text-sm font-semibold text-plum hover:bg-plum/5 disabled:opacity-50 transition"
          >
            <Trash2 className="h-4 w-4" />
            Desconectar
          </button>
        )}
      </div>
    </form>
  );
}
