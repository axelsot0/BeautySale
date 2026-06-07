"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Eye, EyeOff, Plus, Settings2 } from "lucide-react";
import { SECTION_TYPES, sectionLabel } from "@/lib/sections";
import { addSection, deleteSection, toggleSection, moveSection, updateSection } from "./actions";

type SectionRow = {
  id: string;
  type: string;
  active: boolean;
  config: Record<string, string | undefined>;
};

const field = "w-full rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink";

export function SectionBuilder({
  sections,
  categories,
}: {
  sections: SectionRow[];
  categories: { slug: string; name: string }[];
}) {
  const [addType, setAddType] = useState(SECTION_TYPES[0].type);

  return (
    <div className="space-y-6">
      {/* Add */}
      <form action={addSection} className="flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-plum/5 p-4">
        <select name="type" value={addType} onChange={(e) => setAddType(e.target.value as typeof addType)} className={`${field} max-w-xs`}>
          {SECTION_TYPES.map((t) => (
            <option key={t.type} value={t.type}>{t.label}</option>
          ))}
        </select>
        <button className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2 text-sm font-semibold text-cream hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> Agregar
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
      {sections.length === 0 ? (
        <p className="text-center text-plum-soft py-8">Sin secciones. Agregá la primera arriba.</p>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <SectionCard
              key={s.id}
              section={s}
              categories={categories}
              isFirst={i === 0}
              isLast={i === sections.length - 1}
            />
          ))}
        </div>
      )}

      {/* Fixed footer note */}
      <div className="rounded-2xl border border-dashed border-plum/20 px-4 py-3 text-sm text-plum-soft">
        🔻 <strong>Footer</strong> (fijo abajo) — redes y copyright en <a href="/admin/settings" className="text-pink underline">Ajustes</a>
      </div>
    </div>
  );
}

function SectionCard({
  section,
  categories,
  isFirst,
  isLast,
}: {
  section: SectionRow;
  categories: { slug: string; name: string }[];
  isFirst: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasConfig = ["banner", "product_carousel", "mosaic", "newsletter"].includes(section.type);

  return (
    <div className={`rounded-2xl bg-white border ${section.active ? "border-plum/10" : "border-plum/5 opacity-60"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-col">
          <form action={moveSection}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="dir" value="up" />
            <button disabled={isFirst} className="grid h-6 w-6 place-items-center rounded hover:bg-plum/5 disabled:opacity-20">
              <ChevronUp className="h-4 w-4" />
            </button>
          </form>
          <form action={moveSection}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="dir" value="down" />
            <button disabled={isLast} className="grid h-6 w-6 place-items-center rounded hover:bg-plum/5 disabled:opacity-20">
              <ChevronDown className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="flex-1 font-semibold">{sectionLabel(section.type)}</p>

        {hasConfig && (
          <button onClick={() => setOpen((v) => !v)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5" title="Configurar">
            <Settings2 className="h-4 w-4" />
          </button>
        )}

        <form action={toggleSection}>
          <input type="hidden" name="id" value={section.id} />
          <input type="hidden" name="active" value={(!section.active).toString()} />
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5" title={section.active ? "Ocultar" : "Mostrar"}>
            {section.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-plum/40" />}
          </button>
        </form>

        <form action={deleteSection}>
          <input type="hidden" name="id" value={section.id} />
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-pink/10 hover:text-pink" title="Eliminar">
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      </div>

      {open && hasConfig && (
        <form action={updateSection} className="border-t border-plum/5 p-4 space-y-3">
          <input type="hidden" name="id" value={section.id} />
          <input type="hidden" name="type" value={section.type} />
          <ConfigFields section={section} categories={categories} />
          <button className="rounded-full bg-plum text-cream px-5 py-2 text-sm font-semibold hover:bg-pink transition">
            Guardar
          </button>
        </form>
      )}
    </div>
  );
}

function ConfigFields({
  section,
  categories,
}: {
  section: SectionRow;
  categories: { slug: string; name: string }[];
}) {
  const c = section.config;

  if (section.type === "banner") {
    return (
      <>
        <Input name="title" label="Título" def={c.title} />
        <Input name="subtitle" label="Subtítulo" def={c.subtitle} />
        <Input name="image_url" label="Imagen (URL)" def={c.image_url} />
        <div className="grid grid-cols-2 gap-3">
          <Input name="cta_label" label="Texto botón" def={c.cta_label} />
          <Input name="cta_link" label="Link botón" def={c.cta_link} />
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

  if (section.type === "newsletter") {
    return (
      <>
        <Input name="title" label="Título" def={c.title} />
        <Input name="subtitle" label="Subtítulo" def={c.subtitle} />
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
