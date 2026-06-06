"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { saveFlashSale, type FlashFormState } from "./actions";

const INITIAL: FlashFormState = {};

type Current = {
  active: boolean;
  title: string;
  discount_label: string;
  description: string;
  cta_link: string;
  ends_at_local: string;
};

export function FlashSaleForm({ current }: { current: Current }) {
  const [state, action, pending] = useActionState(saveFlashSale, INITIAL);

  return (
    <form action={action} className="space-y-5 rounded-[24px] bg-white border border-plum/5 p-6">
      <label className="flex items-center gap-3">
        <input type="checkbox" name="active" defaultChecked={current.active} className="h-5 w-5 accent-pink" />
        <span className="font-bold text-plum">Activo (visible en la portada)</span>
      </label>

      <div>
        <span className="field-label">Título / etiqueta</span>
        <input name="title" defaultValue={current.title} maxLength={60} required className="field-input" />
      </div>

      <div>
        <span className="field-label">Descuento (texto grande)</span>
        <input
          name="discount_label"
          defaultValue={current.discount_label}
          maxLength={30}
          required
          className="field-input"
        />
      </div>

      <div>
        <span className="field-label">Descripción</span>
        <textarea
          name="description"
          defaultValue={current.description}
          maxLength={300}
          required
          rows={3}
          className="field-input resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <span className="field-label">Link del botón</span>
          <input name="cta_link" defaultValue={current.cta_link} maxLength={200} required className="field-input" />
        </div>
        <div>
          <span className="field-label">Termina (opcional)</span>
          <input
            type="datetime-local"
            name="ends_at"
            defaultValue={current.ends_at_local}
            className="field-input"
          />
          <p className="text-xs text-plum-soft mt-1">Vacío = cuenta regresiva rodante de 24h.</p>
        </div>
      </div>

      {state.error && <p className="text-sm text-pink font-medium">{state.error}</p>}
      {state.ok && <p className="text-sm text-mint font-medium">Flash sale guardada y publicada.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-pink px-6 py-3 font-bold text-cream transition hover:shadow-glow-pink disabled:opacity-60 inline-flex items-center gap-2"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Guardando…" : "Guardar y publicar"}
      </button>
    </form>
  );
}
