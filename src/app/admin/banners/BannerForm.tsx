"use client";

import { useActionState, useState, useRef } from "react";
import { saveBanner, type BannerFormState } from "./actions";
import type { Banner } from "@/lib/data/types";
import { ImagePlus, X } from "lucide-react";

const INITIAL: BannerFormState = {};

const SLOT_OPTIONS = [
  { value: "hero", label: "Hero (banner principal)" },
  { value: "mid", label: "Mid (banner del medio)" },
  { value: "sidebar", label: "Sidebar / secundario" },
];

export function BannerForm({ banner }: { banner?: Banner }) {
  const [state, action, pending] = useActionState(saveBanner, INITIAL);
  const isEdit = !!banner;

  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function clearNewImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const currentImage = preview ?? banner?.image_url ?? null;

  return (
    <form action={action} className="rounded-[24px] bg-white p-6 md:p-8 border border-plum/5 space-y-6 max-w-2xl">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      {banner && !preview && (
        <input type="hidden" name="existing_image_url" value={banner.image_url} />
      )}

      {/* ── Image ── */}
      <div>
        <span className="field-label block mb-3">Imagen del banner</span>
        {currentImage ? (
          <div className="relative group rounded-2xl overflow-hidden border border-plum/10 aspect-[16/6] bg-plum/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentImage} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={clearNewImage}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 grid place-items-center hover:bg-white shadow"
            >
              <X className="h-4 w-4 text-plum" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[16/6] rounded-2xl border-2 border-dashed border-plum/20 flex flex-col items-center justify-center gap-2 hover:border-pink hover:bg-pink/5 transition text-plum-soft"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm font-medium">Subir imagen de banner</span>
            <span className="text-xs">JPG / PNG / WEBP · máx 5MB · recomendado 1440×480px</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {/* ── Title ── */}
      <label className="block">
        <span className="field-label">Título</span>
        <input
          type="text"
          name="title"
          defaultValue={banner?.title}
          required
          maxLength={120}
          placeholder="Hasta 50% OFF en skincare"
          className="field-input"
        />
        {state.fieldErrors?.title && <p className="field-error">{state.fieldErrors.title}</p>}
      </label>

      {/* ── Subtitle ── */}
      <label className="block">
        <span className="field-label">Subtítulo (opcional)</span>
        <input
          type="text"
          name="subtitle"
          defaultValue={banner?.subtitle ?? ""}
          maxLength={200}
          placeholder="Solo por tiempo limitado"
          className="field-input"
        />
      </label>

      {/* ── Link ── */}
      <label className="block">
        <span className="field-label">Link (opcional)</span>
        <input
          type="url"
          name="link"
          defaultValue={banner?.link ?? ""}
          placeholder="https://..."
          className="field-input"
        />
        {state.fieldErrors?.link && <p className="field-error">{state.fieldErrors.link}</p>}
      </label>

      {/* ── Slot + Position ── */}
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">Slot</span>
          <select name="slot" defaultValue={banner?.slot ?? "hero"} className="field-input">
            {SLOT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Posición</span>
          <input
            type="number"
            name="position"
            defaultValue={banner?.position ?? 0}
            min={0}
            className="field-input"
          />
        </label>
      </div>

      {/* ── Active ── */}
      <label className="inline-flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="active"
          defaultChecked={banner?.active ?? true}
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
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear banner"}
        </button>
        <a href="/admin/banners" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-plum/5">
          Cancelar
        </a>
      </div>
    </form>
  );
}
