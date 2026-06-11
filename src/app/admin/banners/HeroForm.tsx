"use client";

import { useActionState, useState, useRef } from "react";
import { saveHero, type HeroFormState } from "./actions";
import type { Banner } from "@/lib/data/types";
import { LinkPicker } from "@/components/admin/LinkPicker";
import { ImagePlus, X } from "lucide-react";

const INITIAL: HeroFormState = {};

export function HeroForm({
  hero,
  categories = [],
}: {
  hero?: Banner;
  categories?: { slug: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(saveHero, INITIAL);

  const [preview, setPreview] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setRemoveExisting(false);
  }

  function clearNewImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage() {
    clearNewImage();
    setRemoveExisting(true);
  }

  const savedImage = hero?.image_url || null;
  const currentImage = preview ?? (removeExisting ? null : savedImage);

  return (
    <form action={action} className="rounded-[24px] bg-white p-6 md:p-8 border border-plum/5 space-y-6 max-w-2xl">
      {hero && <input type="hidden" name="id" value={hero.id} />}
      {hero && !preview && !removeExisting && (
        <input type="hidden" name="existing_image_url" value={hero.image_url} />
      )}
      {removeExisting && <input type="hidden" name="remove_image" value="true" />}

      {/* ── Image ── */}
      <div>
        <span className="field-label block mb-3">Imagen del hero</span>
        {currentImage ? (
          <div className="relative group rounded-2xl overflow-hidden border border-plum/10 aspect-[16/6] bg-plum/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentImage} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={preview ? clearNewImage : removeImage}
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
            <span className="text-sm font-medium">Subir imagen del hero</span>
            <span className="text-xs">JPG / PNG / WEBP · máx 5MB · recomendado 1440×720px</span>
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
          defaultValue={hero?.title}
          required
          maxLength={120}
          placeholder="Glow squad — colección primavera"
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
          defaultValue={hero?.subtitle ?? ""}
          maxLength={200}
          placeholder="Descubrí tus nuevos imprescindibles"
          className="field-input"
        />
      </label>

      {/* ── Eyebrow chip ── */}
      <div className="grid sm:grid-cols-[1fr_auto] gap-4">
        <label className="block">
          <span className="field-label">Chip de eyebrow (texto)</span>
          <input
            type="text"
            name="eyebrow_text"
            defaultValue={hero?.eyebrow_text ?? ""}
            maxLength={40}
            placeholder="✨ Nueva colección"
            className="field-input"
          />
        </label>
        <label className="block">
          <span className="field-label">Color del chip</span>
          <input
            type="color"
            name="eyebrow_color"
            defaultValue={hero?.eyebrow_color || "#FFE066"}
            className="h-11 w-16 rounded-lg border border-plum/10 bg-transparent cursor-pointer"
          />
        </label>
      </div>

      {/* ── CTA primary ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">Botón principal — texto</span>
          <input
            type="text"
            name="cta_label"
            defaultValue={hero?.cta_label ?? ""}
            maxLength={40}
            placeholder="Comprar ahora"
            className="field-input"
          />
        </label>
        <div>
          <LinkPicker
            name="link"
            label="Botón principal — link"
            defaultValue={hero?.link ?? ""}
            categories={categories}
          />
          {state.fieldErrors?.link && <p className="field-error">{state.fieldErrors.link}</p>}
        </div>
      </div>

      {/* ── CTA secondary ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">Botón secundario — texto</span>
          <input
            type="text"
            name="cta2_label"
            defaultValue={hero?.cta2_label ?? ""}
            maxLength={40}
            placeholder="Ver categorías"
            className="field-input"
          />
        </label>
        <LinkPicker
          name="cta2_link"
          label="Botón secundario — link"
          defaultValue={hero?.cta2_link ?? ""}
          categories={categories}
        />
      </div>

      {/* ── Marquee ── */}
      <label className="block">
        <span className="field-label">Texto del marquee (se repite en la imagen)</span>
        <input
          type="text"
          name="marquee_text"
          defaultValue={hero?.marquee_text ?? ""}
          maxLength={60}
          placeholder="NUEVO ★"
          className="field-input"
        />
      </label>

      {/* ── Active ── */}
      <label className="inline-flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="active"
          defaultChecked={hero?.active ?? true}
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
          {pending ? "Guardando…" : hero ? "Guardar cambios" : "Crear hero"}
        </button>
      </div>
    </form>
  );
}
