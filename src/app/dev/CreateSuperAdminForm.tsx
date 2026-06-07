"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { createSuperAdmin, type DevState } from "./actions";

const INITIAL: DevState = {};

const inputCls =
  "w-full rounded-xl border border-cream/15 bg-plum/40 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 outline-none focus:border-pink";

export function CreateSuperAdminForm() {
  const [state, action, pending] = useActionState(createSuperAdmin, INITIAL);

  return (
    <form action={action} className="space-y-4" key={state.ok ? "reset" : "form"}>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-cream/70">Nombre de la tienda</span>
          <input name="store_name" required maxLength={60} placeholder="Glow Cosmetics" className={inputCls} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-cream/70">Slug (URL)</span>
          <input name="slug" maxLength={40} placeholder="glow (opcional, se genera del nombre)" className={inputCls} />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-cream/70">Nombre del dueño</span>
        <input name="full_name" required maxLength={120} placeholder="María González" className={inputCls} />
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-cream/70">Email</span>
          <input name="email" type="email" required placeholder="maria@glow.com" className={inputCls} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-cream/70">Password inicial</span>
          <input name="password" type="text" required minLength={6} maxLength={72} placeholder="mín. 6 caracteres" className={inputCls} />
        </label>
      </div>

      {state.error && <p className="text-sm text-pink font-medium">{state.error}</p>}
      {state.ok && (
        <p className="flex items-center gap-1.5 text-sm text-mint font-medium">
          <Check className="h-4 w-4" /> Tienda creada
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Crear tienda
      </button>
    </form>
  );
}
