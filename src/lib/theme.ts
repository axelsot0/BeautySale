// Theme palette: 11 color tokens mapping to the @theme CSS vars in globals.css.
// Storefront reads the active palette from platform_settings.theme (jsonb).
// On any failure or null, falls back to DEFAULT_PALETTE (the original Bold & Colorful look).

export const DEFAULT_SITE_NAME = "BeautySale";
export const DEFAULT_EDITORIAL_EYEBROW = "🌸 editoriales";
export const DEFAULT_EDITORIAL_TITLE = "Inspiración del mes ✨";

// Hero defaults (used when the hero banner leaves these fields empty).
export const DEFAULT_HERO_EYEBROW = "✨ Nueva colección";
export const DEFAULT_HERO_EYEBROW_COLOR = "#FFE066";
export const DEFAULT_HERO_CTA2_LABEL = "Ver categorías";
export const DEFAULT_HERO_CTA2_LINK = "#categorias";
export const DEFAULT_HERO_MARQUEE = "NUEVO ★";

export type Palette = {
  pink: string;
  pinkSoft: string;
  lavender: string;
  lavenderSoft: string;
  butter: string;
  butterSoft: string;
  mint: string;
  mintSoft: string;
  cream: string;
  plum: string;
  plumSoft: string;
};

export type Preset = {
  id: string;
  name: string;
  tagline: string;
  palette: Palette;
};

// Default palette: Durazno Dorado — cálido, dulce, acogedor.
// Used by all storefronts and platform pages that don't have a custom theme set.
export const DEFAULT_PALETTE: Palette = {
  pink: "#FF7A59",
  pinkSoft: "#FFCBBC",
  lavender: "#F4A26C",
  lavenderSoft: "#FBDDC6",
  butter: "#FFCF5C",
  butterSoft: "#FFEDBF",
  mint: "#9AD9B0",
  mintSoft: "#DCF2E5",
  cream: "#FFF6EE",
  plum: "#4A2511",
  plumSoft: "#7C5740",
};

// The 6 core tokens a user edits in the custom creator. Soft variants are derived.
export const CORE_TOKENS = [
  { key: "pink", label: "Primario" },
  { key: "lavender", label: "Secundario" },
  { key: "butter", label: "Acento" },
  { key: "mint", label: "Detalle" },
  { key: "cream", label: "Fondo" },
  { key: "plum", label: "Texto" },
] as const;

export type CoreToken = (typeof CORE_TOKENS)[number]["key"];

// Lighten a hex color toward white by `amount` (0..1). Used to derive *-soft variants.
export function lighten(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const h = (c: number) => mix(c).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

// Darken a hex toward black by `amount` (0..1). Used to derive plum-soft.
export function darken(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c: number) => Math.round(c * (1 - amount));
  const h = (c: number) => mix(c).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

// Build a full 11-token palette from the 6 core colors a user picks.
export function paletteFromCore(core: Record<CoreToken, string>): Palette {
  return {
    pink: core.pink,
    pinkSoft: lighten(core.pink, 0.55),
    lavender: core.lavender,
    lavenderSoft: lighten(core.lavender, 0.55),
    butter: core.butter,
    butterSoft: lighten(core.butter, 0.5),
    mint: core.mint,
    mintSoft: lighten(core.mint, 0.5),
    cream: core.cream,
    plum: core.plum,
    plumSoft: lighten(core.plum, 0.3),
  };
}

export const isHex = (v: string) => /^#?[0-9a-f]{6}$/i.test((v ?? "").trim());

// Validate + coerce arbitrary jsonb into a Palette, or return null if unusable.
export function parsePalette(raw: unknown): Palette | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const out = {} as Palette;
  for (const k of Object.keys(DEFAULT_PALETTE) as (keyof Palette)[]) {
    const v = r[k];
    if (typeof v !== "string" || !isHex(v)) return null;
    out[k] = v.startsWith("#") ? v : `#${v}`;
  }
  return out;
}

// Map a Palette to the CSS custom properties used across the app.
// Spread directly into a React `style` object on <html>.
export function paletteToCssVars(p: Palette): Record<string, string> {
  return {
    "--color-pink": p.pink,
    "--color-pink-soft": p.pinkSoft,
    "--color-lavender": p.lavender,
    "--color-lavender-soft": p.lavenderSoft,
    "--color-butter": p.butter,
    "--color-butter-soft": p.butterSoft,
    "--color-mint": p.mint,
    "--color-mint-soft": p.mintSoft,
    "--color-cream": p.cream,
    "--color-plum": p.plum,
    "--color-plum-soft": p.plumSoft,
  };
}

// The original pink palette (kept as a preset option).
export const PINK_PALETTE: Palette = {
  pink: "#FF4D8B",
  pinkSoft: "#FFB3CC",
  lavender: "#B5A3E8",
  lavenderSoft: "#E5DEFF",
  butter: "#FFE066",
  butterSoft: "#FFF3B0",
  mint: "#7DD3C0",
  mintSoft: "#CFEFE6",
  cream: "#FFF8F0",
  plum: "#2D1B4E",
  plumSoft: "#5C4A82",
};

// Curated preset palettes with attractive names.
export const PRESETS: Preset[] = [
  {
    id: "durazno-dorado",
    name: "Durazno Dorado",
    tagline: "El look por defecto de la plataforma",
    palette: DEFAULT_PALETTE,
  },
  {
    id: "rosa-original",
    name: "Rosa Original",
    tagline: "El look clásico de BeautySale",
    palette: PINK_PALETTE,
  },
  {
    id: "menta-glacial",
    name: "Menta Glacial",
    tagline: "Fresco, limpio, spa",
    palette: {
      pink: "#2BB6A3",
      pinkSoft: "#A7E8DE",
      lavender: "#5BC0DE",
      lavenderSoft: "#CDEFF6",
      butter: "#FFD56B",
      butterSoft: "#FFEEC2",
      mint: "#7DD3C0",
      mintSoft: "#D6F2EB",
      cream: "#F3FBF9",
      plum: "#11403B",
      plumSoft: "#4A726C",
    },
  },
  {
    id: "lavanda-nocturna",
    name: "Lavanda Nocturna",
    tagline: "Elegante, profundo, premium",
    palette: {
      pink: "#A06CFF",
      pinkSoft: "#D8C4FF",
      lavender: "#7B5CD6",
      lavenderSoft: "#E0D6FA",
      butter: "#F2C94C",
      butterSoft: "#FBEBB8",
      mint: "#6FD0E8",
      mintSoft: "#CDEEF6",
      cream: "#F6F2FF",
      plum: "#231043",
      plumSoft: "#574B73",
    },
  },
  {
    id: "coral-tropical",
    name: "Coral Tropical",
    tagline: "Vibrante, veraniego, atrevido",
    palette: {
      pink: "#FF5A7A",
      pinkSoft: "#FFC2CE",
      lavender: "#FF9E7D",
      lavenderSoft: "#FFD8C9",
      butter: "#FFD93D",
      butterSoft: "#FFEFA8",
      mint: "#46C2A8",
      mintSoft: "#BFEADF",
      cream: "#FFF7F2",
      plum: "#3A1620",
      plumSoft: "#6E4954",
    },
  },
  {
    id: "carbon-neon",
    name: "Carbón Neón",
    tagline: "Oscuro, moderno, eléctrico",
    palette: {
      pink: "#FF2E97",
      pinkSoft: "#FF8AC4",
      lavender: "#9D7BFF",
      lavenderSoft: "#C9B6FF",
      butter: "#F2E14C",
      butterSoft: "#F8F0A0",
      mint: "#36E0C0",
      mintSoft: "#9DF0E2",
      cream: "#1A1626",
      plum: "#F5F0FF",
      plumSoft: "#B9AED1",
    },
  },
];
