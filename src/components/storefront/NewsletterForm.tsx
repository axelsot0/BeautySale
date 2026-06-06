"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const FP_KEY = "bs_fp";

function getOrCreateFp(): string {
  try {
    let fp = localStorage.getItem(FP_KEY);
    if (!fp) {
      fp = crypto.randomUUID();
      localStorage.setItem(FP_KEY, fp);
    }
    return fp;
  } catch {
    return "";
  }
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; code: string }
  | { status: "error"; message: string };

const ERROR_MESSAGES: Record<string, string> = {
  already_subscribed: "Este correo ya está registrado. Revisa tu bandeja de entrada.",
  already_claimed: "Ya recibiste tu código de bienvenida en este dispositivo.",
  invalid_email: "Ingresá un correo válido.",
  server_error: "Ocurrió un error. Intentá de nuevo en un momento.",
};

export function NewsletterForm() {
  const [state, setState] = useState<State>({ status: "idle" });
  const fpRef = useRef<string>("");

  useEffect(() => {
    fpRef.current = getOrCreateFp();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();

    setState({ status: "loading" });

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fp: fpRef.current }),
      });

      const data = await res.json();

      if (res.ok) {
        setState({ status: "success", code: data.code });
        return;
      }

      const msg = ERROR_MESSAGES[data.error as string] ?? ERROR_MESSAGES.server_error;
      setState({ status: "error", message: msg });
    } catch {
      setState({ status: "error", message: ERROR_MESSAGES.server_error });
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-cream/10 border border-cream/20 p-5 space-y-3">
        <div className="flex items-center gap-2 text-mint">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="font-semibold text-cream">¡Bienvenida al Glow Squad!</p>
        </div>
        <p className="text-sm text-cream/70">
          Revisá tu correo — te enviamos el código. También lo tenés acá:
        </p>
        <div className="inline-flex items-center gap-3 rounded-xl border-2 border-dashed border-pink bg-cream/5 px-5 py-3">
          <span className="font-mono text-2xl font-black tracking-widest text-pink">
            {state.code}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(state.code)}
            className="text-xs font-semibold text-cream/60 hover:text-cream transition"
          >
            copiar
          </button>
        </div>
        <p className="text-xs text-cream/50">
          Válido para tu primera compra. No acumulable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          disabled={state.status === "loading"}
          className="flex-1 rounded-full bg-cream/10 backdrop-blur border border-cream/20 px-5 py-3 text-cream placeholder:text-cream/50 outline-none focus:border-pink disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state.status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.5)] transition disabled:opacity-60"
        >
          {state.status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando…
            </>
          ) : (
            "Quiero el 10%"
          )}
        </button>
      </form>
      {state.status === "error" && (
        <p className="text-sm text-pink font-medium pl-2">{state.message}</p>
      )}
    </div>
  );
}
