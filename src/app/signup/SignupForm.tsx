"use client";

import { useActionState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { signupStore, type SignupState } from "./actions";

const INIT: SignupState = {};
const field = "w-full rounded-xl border border-plum/15 px-3.5 py-2.5 text-sm outline-none focus:border-pink transition";
const label = "block text-xs font-semibold text-plum-soft uppercase tracking-wider mb-1";

export function SignupForm({
  next,
  defaultEmail,
  defaultStore,
}: {
  next?: string;
  defaultEmail?: string;
  defaultStore?: string;
}) {
  const [state, action, pending] = useActionState(signupStore, INIT);

  return (
    <form action={action} className="space-y-4">
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {next && <input type="hidden" name="next" value={next} />}

      <div>
        <label className={label}>Nombre de tu tienda</label>
        <input name="store_name" required maxLength={60} defaultValue={defaultStore} placeholder="Glow Beauty" className={field} />
      </div>

      <div>
        <label className={label}>Tu nombre</label>
        <input name="full_name" required maxLength={120} placeholder="María González" className={field} />
      </div>

      <div>
        <label className={label}>Email</label>
        <input name="email" type="email" required defaultValue={defaultEmail} placeholder="maria@ejemplo.com" className={field} />
      </div>

      <div>
        <label className={label}>Contraseña</label>
        <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className={field} />
      </div>

      {state.error && (
        <p className="rounded-xl bg-pink/10 border border-pink/20 px-3 py-2 text-sm text-pink font-medium">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-pink py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] disabled:opacity-60 transition"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {pending ? "Creando tu tienda…" : "Crear mi tienda demo"}
      </button>

      <p className="text-xs text-center text-plum-soft">
        Al crear tu tienda aceptás probarla en modo demo por 15 días.
      </p>
    </form>
  );
}
