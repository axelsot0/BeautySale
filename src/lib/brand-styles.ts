// Typography presets for text-only brand wordmarks (BrandStrip).
// Stored as a key on brands.font_style; resolved to a Tailwind className at render.
export const BRAND_FONT_STYLES: { key: string; label: string; className: string }[] = [
  { key: "serif-italic",        label: "Serif itálica",        className: "font-serif italic font-light" },
  { key: "display-bold",        label: "Display negrita",      className: "font-display font-extrabold tracking-tight" },
  { key: "sans-wide",           label: "Sans espaciada",       className: "font-sans font-light tracking-[0.3em] uppercase" },
  { key: "display-italic",      label: "Display itálica",      className: "font-display font-medium italic" },
  { key: "sans-black",          label: "Sans black",           className: "font-sans font-black tracking-widest" },
  { key: "display-semibold",    label: "Display semibold",     className: "font-display font-semibold" },
  { key: "sans-thin",           label: "Sans fina",            className: "font-sans font-thin tracking-[0.5em]" },
  { key: "display-bold-italic", label: "Display negrita itálica", className: "font-display italic font-bold" },
];

export const DEFAULT_BRAND_STYLE = "display-semibold";

export function brandClass(key: string): string {
  return BRAND_FONT_STYLES.find((s) => s.key === key)?.className ?? "font-display font-semibold";
}

export const BRAND_STYLE_KEYS = BRAND_FONT_STYLES.map((s) => s.key);
