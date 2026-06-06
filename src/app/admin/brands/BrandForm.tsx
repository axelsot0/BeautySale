"use client";

import { useActionState } from "react";
import { saveBrand, type BrandFormState } from "./actions";
import { BRAND_FONT_STYLES, brandClass, DEFAULT_BRAND_STYLE } from "@/lib/brand-styles";
import type { Brand } from "@/lib/data/types";

const INITIAL: BrandFormState = {};

export function BrandForm({ brand }: { brand?: Brand }) {
  const [state, action, pending] = useActionState(saveBrand, INITIAL);
  const isEdit = !!brand;
  const styleKey = brand?.font_style ?? DEFAULT_BRAND_STYLE;

  return (
    <form
      action={action}
      className="rounded-[24px] bg-white p-6 md:p-8 border border-plum/5 space-y-5 max-w-2xl"
    >
      {brand && <input type="hidden" name="id" value={brand.id} />}

      <label className="block">
        <span className="field-label">Nombre de la marca</span>
        <input
          type="text"
          name="name"
          defaultValue={brand?.name}
          maxLength={40}
          required
          placeholder="Lumière"
          className="field-input"
        />
      </label>

      <label className="block">
        <span className="field-label">Estilo tipográfico (si no hay logo)</span>
        <select name="font_style" defaultValue={styleKey} className="field-input">
          {BRAND_FONT_STYLES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-plum-soft text-sm">
          Vista previa:{" "}
          <span className={`text-2xl text-plum ${brandClass(styleKey)}`}>
            {brand?.name || "Marca"}
          </span>
        </p>
      </label>

      <label className="block">
        <span className="field-label">Logo (opcional, reemplaza el texto)</span>
        <input type="file" name="logo" accept="image/*" className="field-input" />
        {brand?.logo_url && (
          <span className="mt-2 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logo_url} alt={brand.name} className="h-10 w-auto object-contain" />
          </span>
        )}
      </label>

      <label className="block">
        <span className="field-label">Posición (orden en el marquee)</span>
        <input type="number" name="position" defaultValue={brand?.position ?? 0} className="field-input" />
      </label>

      <label className="inline-flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="active"
          defaultChecked={brand?.active ?? true}
          className="h-5 w-5 rounded border-plum/20 accent-pink"
        />
        <span className="text-sm font-medium">Activa (visible en home)</span>
      </label>

      {state.error && <p className="text-sm text-pink font-medium">{state.error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] disabled:opacity-60"
        >
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear marca"}
        </button>
        <a href="/admin/brands" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-plum/5">
          Cancelar
        </a>
      </div>
    </form>
  );
}
