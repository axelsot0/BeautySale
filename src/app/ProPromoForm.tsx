"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, BadgePercent } from "lucide-react";
import { PRO_DISCOUNT_PCT } from "@/lib/plans";

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
  already_claimed_email:  "Este correo ya reclamó su descuento.",
  already_claimed_device: "Ya reclamaste un descuento desde este dispositivo.",
  invalid_email:          "Ingresá un correo válido.",
  server_error:           "Ocurrió un error. Intentá de nuevo en un momento.",
};

export function ProPromoForm() {
  const [state, setState] = useState<State>({ status: "idle" });
  const fpRef = useRef<string>("");

  useEffect(() => {
    fpRef.current = getOrCreateFp();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const company = (form.elements.namedItem("company") as HTMLInputElement).value;

    if (!fpRef.current) {
      setState({ status: "error", message: ERROR_MESSAGES.server_error });
      return;
    }

    setState({ status: "loading" });
    try {
      const res = await fetch("/api/promo/pro-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fp: fpRef.current, company }),
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
      <div className="rounded-2xl bg-mint/10 border border-mint/30 p-5 space-y-2 text-left">
        <div className="flex items-center gap-2 text-plum">
          <CheckCircle2 className="h-5 w-5 text-mint shrink-0" />
          <p className="font-semibold">Tu código de {PRO_DISCOUNT_PCT}% OFF en Pro:</p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-xl border-2 border-dashed border-pink bg-white px-5 py-3">
          <span className="font-mono text-xl font-black tracking-widest text-pink">{state.code}</span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(state.code)}
            className="text-xs font-semibold text-plum-soft hover:text-plum transition"
          >
            copiar
          </button>
        </div>
        <p className="text-xs text-plum-soft">Mencionalo al activar tu tienda. Un uso por persona.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        {/* Honeypot */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          disabled={state.status === "loading"}
          className="flex-1 rounded-full bg-white border border-plum/15 px-5 py-3 outline-none focus:border-pink disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state.status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-plum px-6 py-3 font-bold text-cream hover:bg-pink transition disabled:opacity-60"
        >
          {state.status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BadgePercent className="h-4 w-4" />
          )}
          Quiero {PRO_DISCOUNT_PCT}% OFF
        </button>
      </form>
      {state.status === "error" && (
        <p className="text-sm text-pink font-medium pl-2">{state.message}</p>
      )}
    </div>
  );
}
