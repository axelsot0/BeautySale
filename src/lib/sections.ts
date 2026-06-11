// Section type catalog + config shapes for the page-builder.

export type SectionType =
  | "banner"
  | "product_carousel"
  | "mosaic"
  | "flash_sale"
  | "brand_strip"
  | "newsletter";

export const SECTION_TYPES: { type: SectionType; label: string; desc: string }[] = [
  { type: "banner",           label: "Banner / CTA",         desc: "Imagen, título, subtítulo y botón" },
  { type: "product_carousel", label: "Carrusel de productos", desc: "Fila de productos por categoría o destacados" },
  { type: "mosaic",           label: "Mosaico",               desc: "Grilla de banners editoriales" },
  { type: "flash_sale",       label: "Flash sale",            desc: "Banner de oferta con cuenta regresiva" },
  { type: "brand_strip",      label: "Tira de marcas",        desc: "Marquesina de marcas" },
  { type: "newsletter",       label: "Newsletter",            desc: "Bloque de suscripción con código de descuento" },
];

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
};

export function defaultConfig(type: SectionType): SectionConfig {
  switch (type) {
    case "banner":
      return { title: "Nueva promo", subtitle: "", cta_label: "Ver más", cta_link: "/productos", bg_color: "#FF4D8B" };
    case "product_carousel":
      return { source: "featured", eyebrow: "destacados", title: "Lo más vendido" };
    case "mosaic":
      return { eyebrow: "editorial", title: "Explorá" };
    default:
      return {};
  }
}
