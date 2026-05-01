"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const INITIAL: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, INITIAL);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-1.5">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full rounded-2xl border border-plum/10 bg-white px-4 py-3 outline-none focus:border-pink"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-1.5">
          Contraseña
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-2xl border border-plum/10 bg-white px-4 py-3 outline-none focus:border-pink"
        />
      </label>

      {state.error && (
        <p className="text-sm text-pink font-medium">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-pink py-3 font-bold text-cream transition hover:shadow-[0_0_24px_rgba(255,77,139,0.5)] disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Entrar"}
      </button>
    </form>
  );
}
