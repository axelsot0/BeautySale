"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Key, Check, Loader2 } from "lucide-react";
import { resetAdminPassword, type ResetState } from "./actions";

const INITIAL: ResetState = {};

export function ResetPasswordButton({ id, email }: { id: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(resetAdminPassword, INITIAL);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Cambiar contraseña"
        className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5"
      >
        <Key className="h-4 w-4" />
      </button>

      {open && (
        <form
          action={action}
          className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-plum/10 bg-white p-4 shadow-xl space-y-2"
        >
          <input type="hidden" name="id" value={id} />
          <p className="text-xs font-bold uppercase tracking-wider text-plum-soft">
            Nueva password para {email}
          </p>
          <input
            type="password"
            name="password"
            minLength={6}
            required
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink"
          />

          {state.error && <p className="text-xs text-pink font-medium">{state.error}</p>}
          {state.ok && (
            <p className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
              <Check className="h-3.5 w-3.5" /> Contraseña actualizada
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-plum text-cream py-2 text-sm font-semibold hover:bg-pink disabled:opacity-50 transition"
          >
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Resetear
          </button>
        </form>
      )}
    </div>
  );
}
