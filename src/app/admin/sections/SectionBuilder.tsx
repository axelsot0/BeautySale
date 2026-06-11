"use client";

import { useState, useTransition, useEffect } from "react";
import {
  ChevronUp, ChevronDown, Trash2, Eye, EyeOff,
  Plus, Settings2, Loader2, Upload, GripVertical,
} from "lucide-react";
import { SECTION_TYPES, sectionLabel, parseCustomBlocks, MAX_CUSTOM_BLOCKS, type CustomBlock } from "@/lib/sections";
import { LinkPicker } from "@/components/admin/LinkPicker";
import { addSection, deleteSection, toggleSection, moveSection, updateSection, uploadSectionImage, reorderSections } from "./actions";
import type { NewsletterConfig } from "@/lib/data/theme-query";

type SectionRow = {
  id: string;
  type: string;
  active: boolean;
  config: Record<string, string | undefined>;
};

const field = "w-full rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink";

const SECTION_HINT: Record<string, string | undefined> = {
  brand_strip: "Necesita marcas en Admin → Marcas para aparecer",
  mosaic: "Necesita imagenes en Admin → Banners (slot Mosaico) para aparecer",
  flash_sale: "Necesita una Flash Sale activa para aparecer",
};

export function SectionBuilder({
  sections,
  categories,
  newsletterConfig,
  onChanged,
  isPro = false,
}: {
  sections: SectionRow[];
  categories: { slug: string; name: string }[];
  newsletterConfig: NewsletterConfig;
  onChanged?: () => void;
  isPro?: boolean;
}) {
  const [addType, setAddType] = useState(SECTION_TYPES[0].type);
  const [adding, startAdd] = useTransition();

  // Orden local para drag & drop con feedback inmediato
  const [order, setOrder] = useState(() => sections.map((s) => s.id));
  const [dragId, setDragId] = useState<string | null>(null);
  useEffect(() => {
    setOrder(sections.map((s) => s.id));
  }, [sections]);

  const byId = new Map(sections.map((s) => [s.id, s]));
  const ordered = order.map((id) => byId.get(id)).filter(Boolean) as SectionRow[];

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startAdd(async () => {
      await addSection(fd);
      onChanged?.();
    });
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    const from = next.indexOf(dragId);
    const to = next.indexOf(targetId);
    if (from < 0 || to < 0) return;
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    setOrder(next);
    setDragId(null);
    const fd = new FormData();
    fd.set("ids", JSON.stringify(next));
    reorderSections(fd).then(() => onChanged?.());
  }

  return (
    <div className="space-y-6">
      {/* Add */}
      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-plum/5 p-4">
        <select
          name="type"
          value={addType}
          onChange={(e) => setAddType(e.target.value as typeof addType)}
          className={`${field} max-w-xs`}
          disabled={adding}
        >
          {SECTION_TYPES.map((t) => (
            <option key={t.type} value={t.type} disabled={t.pro && !isPro}>
              {t.label}{t.pro ? (isPro ? " ★" : " (PRO)") : ""}
            </option>
          ))}
        </select>
        <button
          disabled={adding}
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Agregar
        </button>
        <span className="text-xs text-plum-soft">
          {SECTION_TYPES.find((t) => t.type === addType)?.desc}
        </span>
      </form>

      {/* Fixed Hero note */}
      <div className="rounded-2xl border border-dashed border-plum/20 px-4 py-3 text-sm text-plum-soft">
        🔝 <strong>Hero</strong> (fijo arriba) — se edita en la pestaña <a href="/admin/banners/hero" className="text-pink underline">Banners → Hero</a>
      </div>

      {/* Stack */}
      {ordered.length === 0 ? (
        <p className="text-center text-plum-soft py-8">Sin secciones. Agregá la primera arriba.</p>
      ) : (
        <div className="space-y-3">
          {ordered.map((s, i) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => setDragId(s.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(s.id)}
              onDragEnd={() => setDragId(null)}
              className={dragId === s.id ? "opacity-40" : ""}
            >
              <SectionCard
                section={s}
                categories={categories}
                newsletterConfig={newsletterConfig}
                isFirst={i === 0}
                isLast={i === ordered.length - 1}
                onChanged={onChanged}
              />
            </div>
          ))}
        </div>
      )}

      {/* Fixed footer note */}
      <div className="rounded-2xl border border-dashed border-plum/20 px-4 py-3 text-sm text-plum-soft">
        🔻 <strong>Footer</strong> (fijo abajo) — redes, textos y copyright en <a href="/admin/settings" className="text-pink underline">Ajustes</a>
      </div>
    </div>
  );
}

function SectionCard({
  section,
  categories,
  newsletterConfig,
  isFirst,
  isLast,
  onChanged,
}: {
  section: SectionRow;
  categories: { slug: string; name: string }[];
  newsletterConfig: NewsletterConfig;
  isFirst: boolean;
  isLast: boolean;
  onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const hasConfig = ["banner", "product_carousel", "mosaic", "newsletter", "custom"].includes(section.type);

  function run(name: string, fn: () => Promise<unknown>) {
    if (pending) return;
    setPendingAction(name);
    startTransition(async () => {
      await fn();
      setPendingAction(null);
      onChanged?.();
    });
  }

  function handleMove(dir: "up" | "down") {
    const fd = new FormData();
    fd.set("id", section.id);
    fd.set("dir", dir);
    run(dir, () => moveSection(fd));
  }

  function handleToggle() {
    const fd = new FormData();
    fd.set("id", section.id);
    fd.set("active", (!section.active).toString());
    run("toggle", () => toggleSection(fd));
  }

  function handleDelete() {
    const fd = new FormData();
    fd.set("id", section.id);
    run("delete", () => deleteSection(fd));
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run("save", () => updateSection(fd));
  }

  function Spinner() {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  return (
    <div className={`rounded-2xl bg-white border ${section.active ? "border-plum/10" : "border-plum/5 opacity-60"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical className="h-4 w-4 text-plum/30 cursor-grab shrink-0" />
        <div className="flex flex-col">
          <button
            onClick={() => handleMove("up")}
            disabled={isFirst || pending}
            className="grid h-6 w-6 place-items-center rounded hover:bg-plum/5 disabled:opacity-20"
          >
            {pendingAction === "up" ? <Spinner /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleMove("down")}
            disabled={isLast || pending}
            className="grid h-6 w-6 place-items-center rounded hover:bg-plum/5 disabled:opacity-20"
          >
            {pendingAction === "down" ? <Spinner /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold">{sectionLabel(section.type)}</p>
          {SECTION_HINT[section.type] && (
            <p className="text-[11px] text-plum/40 leading-tight mt-0.5">{SECTION_HINT[section.type]}</p>
          )}
        </div>

        {hasConfig && (
          <button
            onClick={() => setOpen((v) => !v)}
            disabled={pending}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5 disabled:opacity-40"
            title="Configurar"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={handleToggle}
          disabled={pending}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5 disabled:opacity-40"
          title={section.active ? "Ocultar" : "Mostrar"}
        >
          {pendingAction === "toggle" ? (
            <Spinner />
          ) : section.active ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4 text-plum/40" />
          )}
        </button>

        <button
          onClick={handleDelete}
          disabled={pending}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-pink/10 hover:text-pink disabled:opacity-40"
          title="Eliminar"
        >
          {pendingAction === "delete" ? <Spinner /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      {open && hasConfig && (
        <form onSubmit={handleSave} className="border-t border-plum/5 p-4 space-y-3">
          <input type="hidden" name="id" value={section.id} />
          <input type="hidden" name="type" value={section.type} />
          <ConfigFields section={section} categories={categories} newsletterConfig={newsletterConfig} />
          <button
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-plum text-cream px-5 py-2 text-sm font-semibold hover:bg-pink disabled:opacity-50 transition"
          >
            {pendingAction === "save" && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </button>
        </form>
      )}
    </div>
  );
}

// Image upload field — manages its own URL state so the hidden input stays in sync
function ImageUrlField({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    const fd = new FormData();
    fd.set("file", file);
    startUpload(async () => {
      const result = await uploadSectionImage(fd);
      if (result.url) setUrl(result.url);
      else setUploadError(result.error ?? "Error al subir");
    });
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-plum-soft block">Imagen</span>
      <div className="flex gap-2 items-center flex-wrap">
        <input
          name={name}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://... o subí un archivo"
          className={`${field} flex-1 min-w-[200px]`}
        />
        <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-full border border-plum/20 px-4 py-2 text-sm hover:bg-plum/5 transition">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Subir
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      {uploadError && <p className="text-xs text-pink">{uploadError}</p>}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-20 rounded-xl object-cover border border-plum/10" />
      )}
    </div>
  );
}

function ConfigFields({
  section,
  categories,
  newsletterConfig,
}: {
  section: SectionRow;
  categories: { slug: string; name: string }[];
  newsletterConfig: NewsletterConfig;
}) {
  const c = section.config;

  if (section.type === "banner") {
    return (
      <>
        <Input name="title" label="Título" def={c.title} />
        <Input name="subtitle" label="Subtítulo" def={c.subtitle} />
        <ImageUrlField name="image_url" defaultValue={c.image_url} />
        <div className="grid grid-cols-2 gap-3">
          <Input name="cta_label" label="Texto botón" def={c.cta_label} />
          <LinkPicker name="cta_link" label="Link botón" defaultValue={c.cta_link} categories={categories} />
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-plum-soft">Color de fondo</span>
          <input type="color" name="bg_color" defaultValue={c.bg_color || "#FF4D8B"} className="h-10 w-20 rounded" />
        </label>
      </>
    );
  }

  if (section.type === "product_carousel") {
    return (
      <>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-plum-soft">Origen</span>
          <select name="source" defaultValue={c.source || "featured"} className={field}>
            <option value="featured">Destacados</option>
            <option value="category">Por categoría</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-plum-soft">Categoría (si aplica)</span>
          <select name="category_slug" defaultValue={c.category_slug || ""} className={field}>
            <option value="">—</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input name="eyebrow" label="Eyebrow" def={c.eyebrow} />
          <Input name="title" label="Título" def={c.title} />
        </div>
      </>
    );
  }

  if (section.type === "mosaic") {
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <Input name="eyebrow" label="Eyebrow" def={c.eyebrow} />
          <Input name="title" label="Título" def={c.title} />
        </div>
        <p className="text-xs text-plum-soft">Las imágenes del mosaico se gestionan en Banners (slot Mosaic).</p>
      </>
    );
  }

  if (section.type === "custom") {
    return <CustomBlocksEditor initial={parseCustomBlocks(c.blocks_json)} />;
  }

  if (section.type === "newsletter") {
    return (
      <>
        <p className="text-xs text-plum-soft">
          Este contenido es global de la tienda. También editable en{" "}
          <a href="/admin/settings#newsletter" className="text-pink underline">Ajustes → Newsletter</a>.
        </p>
        <Input name="title" label="Título" def={newsletterConfig.title} />
        <Input name="subtitle" label="Subtítulo / descripción" def={newsletterConfig.subtitle} />
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-plum-soft">% de descuento</span>
          <input
            type="number"
            name="discount_pct"
            defaultValue={newsletterConfig.discountPct}
            min={1}
            max={100}
            className={`${field} max-w-[120px]`}
          />
        </label>
      </>
    );
  }

  return null;
}

function Input({ name, label, def }: { name: string; label: string; def?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-plum-soft">{label}</span>
      <input name={name} defaultValue={def ?? ""} className={field} />
    </label>
  );
}

// ── Editor de bloques (sección personalizada, PRO) ─────────────────────────

const BLOCK_LABELS: Record<CustomBlock["kind"], string> = {
  heading: "Título",
  text: "Texto",
  image: "Imagen",
  button: "Botón",
};

function newBlock(kind: CustomBlock["kind"]): CustomBlock {
  switch (kind) {
    case "heading": return { kind, text: "" };
    case "text":    return { kind, text: "" };
    case "image":   return { kind, url: "" };
    case "button":  return { kind, label: "", link: "" };
  }
}

function CustomBlocksEditor({ initial }: { initial: CustomBlock[] }) {
  const [blocks, setBlocks] = useState<CustomBlock[]>(initial);
  const [addKind, setAddKind] = useState<CustomBlock["kind"]>("heading");

  function update(i: number, patch: Partial<CustomBlock>) {
    setBlocks((bs) => bs.map((b, j) => (j === i ? ({ ...b, ...patch } as CustomBlock) : b)));
  }
  function remove(i: number) {
    setBlocks((bs) => bs.filter((_, j) => j !== i));
  }
  function move(i: number, dir: -1 | 1) {
    setBlocks((bs) => {
      const next = [...bs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return bs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="blocks_json" value={JSON.stringify(blocks)} />

      {blocks.map((b, i) => (
        <div key={i} className="rounded-xl border border-plum/10 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-plum-soft">
              {BLOCK_LABELS[b.kind]}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="grid h-7 w-7 place-items-center rounded hover:bg-plum/5 disabled:opacity-20">
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1}
                className="grid h-7 w-7 place-items-center rounded hover:bg-plum/5 disabled:opacity-20">
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => remove(i)}
                className="grid h-7 w-7 place-items-center rounded hover:bg-pink/10 hover:text-pink">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {(b.kind === "heading" || b.kind === "text") && (
            b.kind === "text" ? (
              <textarea
                value={b.text}
                onChange={(e) => update(i, { text: e.target.value })}
                rows={2}
                placeholder="Escribí el texto…"
                className={field}
              />
            ) : (
              <input
                value={b.text}
                onChange={(e) => update(i, { text: e.target.value })}
                placeholder="Título…"
                className={field}
              />
            )
          )}
          {b.kind === "image" && (
            <input
              value={b.url}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder="https://… (URL de la imagen)"
              className={field}
            />
          )}
          {b.kind === "button" && (
            <div className="grid grid-cols-2 gap-2">
              <input
                value={b.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Texto del botón"
                className={field}
              />
              <input
                value={b.link}
                onChange={(e) => update(i, { link: e.target.value })}
                placeholder="/productos o https://…"
                className={field}
              />
            </div>
          )}
        </div>
      ))}

      {blocks.length < MAX_CUSTOM_BLOCKS && (
        <div className="flex items-center gap-2">
          <select
            value={addKind}
            onChange={(e) => setAddKind(e.target.value as CustomBlock["kind"])}
            className={`${field} max-w-[160px]`}
          >
            {(Object.keys(BLOCK_LABELS) as CustomBlock["kind"][]).map((k) => (
              <option key={k} value={k}>{BLOCK_LABELS[k]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setBlocks((bs) => [...bs, newBlock(addKind)])}
            className="inline-flex items-center gap-1.5 rounded-full border border-plum/20 px-4 py-2 text-sm font-semibold hover:bg-plum/5 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar bloque
          </button>
        </div>
      )}
    </div>
  );
}
