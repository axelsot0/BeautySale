"use client";

import { useActionState } from "react";
import { createAdmin, type AdminFormState } from "./actions";

const INITIAL: AdminFormState = {};

export function AdminForm() {
  const [state, action, pending] = useActionState(createAdmin, INITIAL);

  return (
    <form action={action} className="rounded-[24px] bg-white p-6 md:p-8 border border-plum/5 space-y-5">
      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-1.5">
          Nombre completo
        </span>
        <input
          type="text"
          name="full_name"
          required
          maxLength={120}
          placeholder="María González"
          className="w-full rounded-2xl border border-plum/10 bg-cream/40 px-4 py-3 outline-none focus:border-pink focus:bg-white"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-1.5">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          placeholder="admin@ejemplo.com"
          className="w-full rounded-2xl border border-plum/10 bg-cream/40 px-4 py-3 outline-none focus:border-pink focus:bg-white"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-1.5">
          Password (mín. 6 caracteres)
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          maxLength={72}
          placeholder="••••••"
          className="w-full rounded-2xl border border-plum/10 bg-cream/40 px-4 py-3 outline-none focus:border-pink focus:bg-white"
        />
      </label>

      {state.error && <p className="text-sm text-pink font-medium">{state.error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear admin"}
        </button>
        <a href="/admin/admins" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-plum/5">
          Cancelar
        </a>
      </div>
    </form>
  );
}
