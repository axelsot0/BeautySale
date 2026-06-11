"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Star, Loader2, Check } from "lucide-react";
import { saveNavLinks, type SettingsState } from "./actions";
import type { NavLink } from "@/lib/data/theme-query";

const field = "rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink";
const INITIAL: SettingsState = {};
const CUSTOM = "__custom__";

const STATIC_LINKS = [
  { value: "/productos", label: "Todos los productos" },
  { value: "/ofertas", label: "Ofertas" },
  { value: "/store", label: "Inicio de la tienda" },
];

export function NavLinksForm({
  links,
  categories = [],
}: {
  links: NavLink[];
  categories?: { slug: string; name: string }[];
}) {
  const [items, setItems] = useState<NavLink[]>(links);
  const [state, setState] = useState<SettingsState>(INITIAL);
  const [pending, startTransition] = useTransition();

  const options = [
    ...STATIC_LINKS,
    ...categories.map((c) => ({ value: `/c/${c.slug}`, label: `Categoría: ${c.name}` })),
  ];
  const known = new Set(options.map((o) => o.value));

  function add() {
    setItems((p) => [...p, { label: "", href: "", highlight: false }]);
  }

  function remove(i: number) {
    setItems((p) => p.filter((_, idx) => idx !== i));
  }

  function updateField(i: number, key: keyof NavLink, value: string | boolean) {
    setItems((p) => p.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const valid = items.filter((l) => l.label.trim() && l.href.trim());
    const fd = new FormData();
    fd.set("nav_links", JSON.stringify(valid));
    startTransition(async () => {
      const result = await saveNavLinks(INITIAL, fd);
      setState(result);
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-plum-soft">Sin enlaces. Agregá el primero abajo.</p>
      )}
      {items.map((item, i) => {
        const isCustom = item.href !== "" && !known.has(item.href);
        return (
          <div key={i} className="flex gap-2 items-center flex-wrap">
            <input
              value={item.label}
              onChange={(e) => updateField(i, "label", e.target.value)}
              placeholder="Etiqueta (ej: Ojos)"
              className={`${field} flex-1 min-w-[140px]`}
            />
            <select
              value={isCustom ? CUSTOM : item.href}
              onChange={(e) =>
                updateField(i, "href", e.target.value === CUSTOM ? "/" : e.target.value)
              }
              className={`${field} flex-1 min-w-[160px]`}
            >
              <option value="">— Elegí destino —</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
              <option value={CUSTOM}>URL personalizada…</option>
            </select>
            {isCustom && (
              <input
                value={item.href}
                onChange={(e) => updateField(i, "href", e.target.value)}
                placeholder="https://... o /ruta"
                className={`${field} flex-1 min-w-[160px]`}
              />
            )}
            <button
              type="button"
              onClick={() => updateField(i, "highlight", !item.highlight)}
              title="Destacar con color accent"
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
                item.highlight ? "bg-pink text-cream" : "border border-plum/15 hover:bg-plum/5"
              }`}
            >
              <Star className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-pink/10 hover:text-pink"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}

      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-full border border-plum/20 px-4 py-2 text-sm hover:bg-plum/5 transition"
        >
          <Plus className="h-4 w-4" /> Agregar enlace
        </button>
        <button
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
        </button>
        {state.ok && (
          <span className="text-sm text-mint flex items-center gap-1">
            <Check className="h-4 w-4" /> ok
          </span>
        )}
        {state.error && <span className="text-sm text-pink">{state.error}</span>}
      </div>

      <p className="text-xs text-plum-soft">
        ★ = destacado (color accent). El header muestra estos enlaces en el orden de la lista.
      </p>
    </form>
  );
}
