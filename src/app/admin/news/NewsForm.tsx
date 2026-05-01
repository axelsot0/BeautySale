"use client";

import { useActionState } from "react";
import { saveNews, type NewsFormState } from "./actions";
import type { News } from "@/lib/data/types";

const INITIAL: NewsFormState = {};

export function NewsForm({ news }: { news?: News }) {
  const [state, action, pending] = useActionState(saveNews, INITIAL);
  const isEdit = !!news;

  return (
    <form action={action} className="rounded-[24px] bg-white p-6 md:p-8 border border-plum/5 space-y-5 max-w-2xl">
      {news && <input type="hidden" name="id" value={news.id} />}

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-1.5">
          Mensaje
        </span>
        <input
          type="text"
          name="text"
          defaultValue={news?.text}
          maxLength={140}
          required
          placeholder="✨ Envío gratis +$50"
          className="w-full rounded-2xl border border-plum/10 bg-cream/40 px-4 py-3 outline-none focus:border-pink focus:bg-white"
        />
        <p className="text-xs text-plum-soft mt-1">Máximo 140 caracteres. Emojis bienvenidos 💖</p>
      </label>

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-1.5">
          Posición (orden en la barra)
        </span>
        <input
          type="number"
          name="position"
          defaultValue={news?.position ?? 0}
          className="w-full rounded-2xl border border-plum/10 bg-cream/40 px-4 py-3 outline-none focus:border-pink focus:bg-white"
        />
      </label>

      <label className="inline-flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="active"
          defaultChecked={news?.active ?? true}
          className="h-5 w-5 rounded border-plum/20 accent-pink"
        />
        <span className="text-sm font-medium">Activo (visible en home)</span>
      </label>

      {state.error && <p className="text-sm text-pink font-medium">{state.error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] disabled:opacity-60"
        >
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear mensaje"}
        </button>
        <a href="/admin/news" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-plum/5">
          Cancelar
        </a>
      </div>
    </form>
  );
}
