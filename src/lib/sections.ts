// Section type catalog + config shapes for the page-builder.

export type SectionType =
  | "banner"
  | "product_carousel"
  | "mosaic"
  | "flash_sale"
  | "brand_strip"
  | "newsletter"
  | "custom";

export const SECTION_TYPES: { type: SectionType; label: string; desc: string; pro?: boolean }[] = [
  { type: "banner",           label: "Banner / CTA",         desc: "Imagen, título, subtítulo y botón" },
  { type: "product_carousel", label: "Carrusel de productos", desc: "Fila de productos por categoría o destacados" },
  { type: "mosaic",           label: "Mosaico",               desc: "Grilla de banners editoriales" },
  { type: "flash_sale",       label: "Flash sale",            desc: "Banner de oferta con cuenta regresiva" },
  { type: "brand_strip",      label: "Tira de marcas",        desc: "Marquesina de marcas" },
  { type: "newsletter",       label: "Newsletter",            desc: "Bloque de suscripción con código de descuento" },
  { type: "custom",           label: "Sección personalizada", desc: "Armala con bloques: títulos, textos, imágenes y botones", pro: true },
];

// Bloques de la sección personalizada (plan PRO)
export type CustomBlock =
  | { kind: "heading"; text: string }
  | { kind: "text"; text: string }
  | { kind: "image"; url: string }
  | { kind: "button"; label: string; link: string };

export const MAX_CUSTOM_BLOCKS = 12;

export function parseCustomBlocks(raw: string | undefined): CustomBlock[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((b) => b && typeof b === "object" && typeof b.kind === "string")
      .slice(0, MAX_CUSTOM_BLOCKS) as CustomBlock[];
  } catch {
    return [];
  }
}

export function sectionLabel(type: string): string {
  return SECTION_TYPES.find((s) => s.type === type)?.label ?? type;
}

// Loose config bag; each type reads its known keys.
export type SectionConfig = {
  // banner
  title?: string;
  subtitle?: string;
  image_url?: string;
  cta_label?: string;
  cta_link?: string;
  bg_color?: string;
  // product_carousel
  source?: "featured" | "category";
  category_slug?: string;
  eyebrow?: string;
  // custom (JSON serializado de CustomBlock[])
  blocks_json?: string;
};

export function defaultConfig(type: SectionType): SectionConfig {
  switch (type) {
    case "banner":
      return { title: "Nueva promo", subtitle: "", cta_label: "Ver más", cta_link: "/productos", bg_color: "#FF4D8B" };
    case "product_carousel":
      return { source: "featured", eyebrow: "destacados", title: "Lo más vendido" };
    case "mosaic":
      return { eyebrow: "editorial", title: "Explorá" };
    case "custom":
      return {
        blocks_json: JSON.stringify([
          { kind: "heading", text: "Tu título acá" },
          { kind: "text", text: "Contá algo sobre tu tienda, una promo o lo que quieras." },
        ]),
      };
    default:
      return {};
  }
}
