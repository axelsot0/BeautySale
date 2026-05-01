"use client";

import { useActionState, useState, useRef } from "react";
import type { Category } from "@/lib/data/types";
import { saveCategory, type CategoryFormState } from "./actions";
import { ImagePlus, X } from "lucide-react";

const PALETTE = [
  "#FF4D8B", "#B5A3E8", "#FFE066", "#7DD3C0",
  "#FFB3CC", "#E5DEFF", "#FFF3B0", "#CFEFE6",
];

const INITIAL: CategoryFormState = {};

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategory, INITIAL);
  const isEdit = !!category;

  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  }

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const currentImage = preview ?? category?.image_url ?? null;

  return (
    <form action={action} className="rounded-[24px] bg-white p-6 md:p-8 border border-plum/5 space-y-5 max-w-2xl">
      {category && <input type="hidden" name="id" value={category.id} />}
      {category?.image_url && !preview && (
        <input type="hidden" name="existing_image_url" value={category.image_url} />
      )}

      <Field label="Nombre" name="name" defaultValue={category?.name} required error={state.fieldErrors?.name} />
      <Field label="Slug (opcional)" name="slug" defaultValue={category?.slug} placeholder="se genera del nombre" />

      {/* Color */}
      <div>
        <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-1.5">Color</span>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="color"
            defaultValue={category?.color ?? "#FF4D8B"}
            className="h-12 w-16 rounded-2xl border border-plum/10 cursor-pointer"
          />
          <div className="flex flex-wrap gap-1.5">
            {PALETTE.map((c) => (
              <ColorChip key={c} color={c} />
            ))}
          </div>
        </div>
      </div>

      <Field label="Icono (emoji)" name="icon" defaultValue={category?.icon ?? ""} placeholder="💖" />
      <Field label="Posición" name="position" type="number" defaultValue={String(category?.position ?? 0)} />

      {/* Image upload */}
      <div>
        <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-3">
          Imagen de la categoría (opcional)
        </span>
        {currentImage ? (
          <div className="relative group h-32 w-32 rounded-full overflow-hidden border-2 border-plum/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentImage} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute inset-0 flex items-center justify-center bg-plum/60 opacity-0 group-hover:opacity-100 transition"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-32 w-32 rounded-full border-2 border-dashed border-plum/20 flex flex-col items-center justify-center gap-1 hover:border-pink hover:bg-pink/5 transition text-plum-soft"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Subir</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFile}
          className="hidden"
        />
        <p className="text-xs text-plum-soft mt-2">Recomendado: imagen cuadrada · JPG/PNG/WEBP · máx 5MB</p>
      </div>

      {state.error && <p className="text-sm text-pink font-medium">{state.error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] disabled:opacity-60"
        >
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear categoría"}
        </button>
        <a href="/admin/categories" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-plum/5">
          Cancelar
        </a>
      </div>
    </form>
  );
}

function Field({
  label, name, type = "text", defaultValue, placeholder, required, error,
}: {
  label: string; name: string; type?: string;
  defaultValue?: string; placeholder?: string;
  required?: boolean; error?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-plum-soft mb-1.5">{label}</span>
      <input
        type={type} name={name} defaultValue={defaultValue}
        placeholder={placeholder} required={required}
        className="w-full rounded-2xl border border-plum/10 bg-cream/40 px-4 py-3 outline-none focus:border-pink focus:bg-white"
      />
      {error && <p className="text-xs text-pink mt-1">{error}</p>}
    </label>
  );
}

function ColorChip({ color }: { color: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        const input = e.currentTarget.closest("form")?.querySelector<HTMLInputElement>('input[name="color"]');
        if (input) input.value = color;
      }}
      style={{ backgroundColor: color }}
      className="h-9 w-9 rounded-full border-2 border-cream shadow-sm hover:scale-110 transition"
      aria-label={`Color ${color}`}
    />
  );
}
