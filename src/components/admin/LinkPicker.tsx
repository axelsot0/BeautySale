"use client";

import { useState } from "react";

// Destinos comunes de una tienda + opción de URL libre.
// Emite un único input[name] con el valor final (compatible con FormData).

const field = "w-full rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink";

const STATIC_LINKS = [
  { value: "/productos", label: "Todos los productos" },
  { value: "/ofertas", label: "Ofertas" },
  { value: "/store", label: "Inicio de la tienda" },
];

const CUSTOM = "__custom__";

export function LinkPicker({
  name,
  label,
  defaultValue = "",
  categories = [],
}: {
  name: string;
  label: string;
  defaultValue?: string;
  categories?: { slug: string; name: string }[];
}) {
  const options = [
    ...STATIC_LINKS,
    ...categories.map((c) => ({ value: `/c/${c.slug}`, label: `Categoría: ${c.name}` })),
  ];
  const isKnown = options.some((o) => o.value === defaultValue);
  const [mode, setMode] = useState<string>(
    defaultValue && !isKnown ? CUSTOM : defaultValue || "",
  );
  const [custom, setCustom] = useState(defaultValue && !isKnown ? defaultValue : "");

  const value = mode === CUSTOM ? custom : mode;

  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-plum-soft">{label}</span>
      <input type="hidden" name={name} value={value} />
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className={field}
      >
        <option value="">— Sin link —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        <option value={CUSTOM}>URL personalizada…</option>
      </select>
      {mode === CUSTOM && (
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="https://... o /ruta"
          className={field}
        />
      )}
    </label>
  );
}
