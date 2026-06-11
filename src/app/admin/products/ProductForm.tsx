"use client";

import { useActionState, useState, useRef } from "react";
import { saveProduct, type ProductFormState } from "./actions";
import type { Product, Category } from "@/lib/data/types";
import { X, ImagePlus } from "lucide-react";

const INITIAL: ProductFormState = {};

interface Props {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: Props) {
  const [state, action, pending] = useActionState(saveProduct, INITIAL);
  const isEdit = !!product;

  // Track existing images (can remove)
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  // Preview new images before upload
  const [newPreviews, setNewPreviews] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Linked on_sale + discount state
  const [onSale, setOnSale]     = useState(product?.on_sale ?? false);
  const [discount, setDiscount] = useState(product?.discount_percent ?? 0);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const previews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setNewPreviews((prev) => [...prev, ...previews]);
    // Reset input so same file can be re-added after removal
    e.target.value = "";
  }

  function removeExisting(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  function removeNew(idx: number) {
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  // We need to inject new files into form submission via a DataTransfer
  // Since useActionState uses native FormData, we handle via a custom submit
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // files are already in the <input type="file" name="new_images" multiple>
    // but we replaced the file input value — instead use a hidden file input
    // technique: we store files in a ref and append them. Here we let the
    // form action receive the files from the rendered hidden inputs.
    // Actually the preview approach stores File objects; we must write them
    // back to the file input before submission.
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      for (const p of newPreviews) dt.items.add(p.file);
      fileInputRef.current.files = dt.files;
    }
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="rounded-[24px] bg-white p-6 md:p-8 border border-plum/5 space-y-6 max-w-3xl"
    >
      {product && <input type="hidden" name="id" value={product.id} />}

      {/* Existing images as hidden inputs so action receives them */}
      {existingImages.map((url) => (
        <input key={url} type="hidden" name="existing_images" value={url} />
      ))}

      {/* ── Title ── */}
      <label className="block">
        <span className="field-label">Nombre del producto</span>
        <input
          type="text"
          name="title"
          defaultValue={product?.title}
          required
          maxLength={160}
          placeholder="Sérum vitamina C 30ml"
          className="field-input"
        />
        {state.fieldErrors?.title && <p className="field-error">{state.fieldErrors.title}</p>}
      </label>

      {/* ── Slug ── */}
      <label className="block">
        <span className="field-label">Slug (URL) — se genera solo si lo dejás vacío</span>
        <input
          type="text"
          name="slug"
          defaultValue={product?.slug}
          maxLength={160}
          placeholder="serum-vitamina-c-30ml"
          className="field-input"
        />
      </label>

      {/* ── Description ── */}
      <label className="block">
        <span className="field-label">Descripción</span>
        <textarea
          name="description"
          defaultValue={product?.description}
          maxLength={2000}
          rows={4}
          placeholder="Describí el producto, ingredientes, modo de uso…"
          className="field-input resize-none"
        />
      </label>

      {/* ── Price ── */}
      <label className="block">
        <span className="field-label">Precio ($)</span>
        <input
          type="number"
          name="price"
          defaultValue={product?.price}
          min={0}
          step={0.01}
          required
          placeholder="29.99"
          className="field-input"
        />
        {state.fieldErrors?.price && <p className="field-error">{state.fieldErrors.price}</p>}
      </label>

      {/* ── Stock + Category ── */}
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">Stock</span>
          <input
            type="number"
            name="stock"
            defaultValue={product?.stock ?? 0}
            min={0}
            className="field-input"
          />
        </label>

        <label className="block">
          <span className="field-label">Categoría</span>
          <input
            type="text"
            name="category_name"
            list="cat-list"
            defaultValue={
              categories.find((c) => c.id === product?.category_id)?.name ?? ""
            }
            placeholder="Elegí o escribí nueva…"
            className="field-input"
            autoComplete="off"
          />
          <datalist id="cat-list">
            {categories.map((c) => (
              <option key={c.id} value={c.icon ? `${c.icon} ${c.name}` : c.name} />
            ))}
          </datalist>
          <p className="text-[11px] text-plum-soft mt-1">
            Elegí una existente o escribí un nombre nuevo para crearla al guardar.
          </p>
        </label>
      </div>

      {/* ── Featured ── */}
      <label className="inline-flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={product?.featured ?? false}
          className="h-5 w-5 rounded border-plum/20 accent-pink"
        />
        <span className="text-sm font-medium">⭐ Destacado</span>
      </label>

      {/* ── On sale + linked discount ── */}
      <div className="rounded-2xl border border-plum/10 p-4 space-y-3">
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="on_sale"
            checked={onSale}
            onChange={(e) => {
              setOnSale(e.target.checked);
              if (!e.target.checked) setDiscount(0);
            }}
            className="h-5 w-5 rounded border-plum/20 accent-pink"
          />
          <span className="text-sm font-medium">🔥 En oferta</span>
        </label>

        {onSale && (
          <div className="pl-8">
            <span className="field-label">Porcentaje de descuento</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="discount_percent"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                min={1}
                max={99}
                step={1}
                required
                className="field-input w-32"
              />
              <span className="text-2xl font-display text-plum-soft">%</span>
            </div>
            <p className="text-xs text-plum-soft mt-1">
              Entre 1 y 99. Aparece tachado el precio original en la tienda.
            </p>
          </div>
        )}

        {!onSale && (
          <input type="hidden" name="discount_percent" value={0} />
        )}
      </div>

      {/* ── Images ── */}
      <div>
        <span className="field-label block mb-3">Imágenes</span>

        <div className="flex flex-wrap gap-3">
          {/* Existing images */}
          {existingImages.map((url) => (
            <div key={url} className="relative group h-24 w-24 rounded-2xl overflow-hidden border border-plum/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute inset-0 flex items-center justify-center bg-plum/60 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}

          {/* New image previews */}
          {newPreviews.map(({ url }, idx) => (
            <div key={url} className="relative group h-24 w-24 rounded-2xl overflow-hidden border-2 border-dashed border-pink/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeNew(idx)}
                className="absolute inset-0 flex items-center justify-center bg-plum/60 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}

          {/* Add button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-24 w-24 rounded-2xl border-2 border-dashed border-plum/20 flex flex-col items-center justify-center gap-1 hover:border-pink hover:bg-pink/5 transition text-plum-soft"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Agregar</span>
          </button>
        </div>

        {/* Hidden real file input */}
        <input
          ref={fileInputRef}
          type="file"
          name="new_images"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-xs text-plum-soft mt-2">JPG / PNG / WEBP / AVIF · máx 5MB por imagen</p>
      </div>

      {state.error && <p className="text-sm text-pink font-medium">{state.error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] disabled:opacity-60"
        >
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
        <a href="/admin/products" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-plum/5">
          Cancelar
        </a>
      </div>
    </form>
  );
}
