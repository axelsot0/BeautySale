import type { Category, Product, Banner, News, FlashSale, Brand } from "./types";
import { slugify } from "@/lib/utils";

const now = new Date().toISOString();

export const mockCategories: Category[] = [
  { id: "c1", name: "Cuidado personal", slug: "cuidado-personal", color: "#7DD3C0", icon: "💆‍♀️", image_url: null, position: 0, created_at: now },
  { id: "c2", name: "Ojos",             slug: "ojos",             color: "#B5A3E8", icon: "👁️",   image_url: null, position: 1, created_at: now },
  { id: "c3", name: "Labios",           slug: "labios",           color: "#FF4D8B", icon: "💋",   image_url: null, position: 2, created_at: now },
  { id: "c4", name: "Rostro",           slug: "rostro",           color: "#FFE066", icon: "✨",   image_url: null, position: 3, created_at: now },
  { id: "c5", name: "Cabello",          slug: "cabello",          color: "#E5DEFF", icon: "💁‍♀️", image_url: null, position: 4, created_at: now },
  { id: "c6", name: "Accesorios",       slug: "accesorios",       color: "#CFEFE6", icon: "💖",   image_url: null, position: 5, created_at: now },
];

const product = (
  id: string,
  title: string,
  price: number,
  category_id: string,
  opts: Partial<Pick<Product, "discount_percent" | "featured" | "on_sale" | "stock">> = {},
): Product => ({
  id,
  title,
  slug: slugify(title),
  description: "",
  price,
  discount_percent: opts.discount_percent ?? 0,
  stock: opts.stock ?? 25,
  category_id,
  featured: opts.featured ?? false,
  on_sale: opts.on_sale ?? false,
  images: [],
  created_at: now,
  updated_at: now,
});

export const mockProducts: Product[] = [
  product("p1", "Sérum vitamina C glow",        24.99, "c4", { featured: true,  on_sale: true, discount_percent: 20 }),
  product("p2", "Máscara hidratante overnight", 18.50, "c4", { featured: true }),
  product("p3", "Labial mate cherry pop",       12.00, "c3", { featured: true,  on_sale: true, discount_percent: 30 }),
  product("p4", "Paleta sombras sunset",        29.90, "c2", { featured: true }),
  product("p5", "Crema corporal manteca karité",16.00, "c1", { featured: true }),
  product("p6", "Delineador líquido waterproof", 9.90, "c2", { featured: true,  on_sale: true, discount_percent: 15 }),
  product("p7", "Bálsamo labial cherry",         6.50, "c3", { featured: true }),
  product("p8", "Mascarilla facial detox",      14.20, "c4", { featured: true }),

  product("p9",  "Crema de manos vainilla",      8.00,  "c1"),
  product("p10", "Aceite corporal rosas",       19.90, "c1"),
  product("p11", "Body mist algodón",           11.50, "c1"),
  product("p12", "Exfoliante azúcar mango",     13.00, "c1", { on_sale: true, discount_percent: 25 }),
  product("p13", "Crema de pies relax",          9.50, "c1"),

  product("p14", "Máscara de pestañas volumen", 13.20, "c2"),
  product("p15", "Sombra glitter cosmic",       10.00, "c2", { on_sale: true, discount_percent: 40 }),
  product("p16", "Primer ojos long-lasting",    11.50, "c2"),
  product("p17", "Iluminador ojos opal",         8.90, "c2"),
  product("p18", "Pinceles ojos kit x4",        17.00, "c2"),
];

const heroExtra = {
  eyebrow_text: "✨ Nueva colección",
  eyebrow_color: "#FFE066",
  cta2_label: "Ver categorías",
  cta2_link: "#categorias",
  marquee_text: "NUEVO ★",
};
const noHeroExtra = {
  eyebrow_text: null,
  eyebrow_color: null,
  cta2_label: null,
  cta2_link: null,
  marquee_text: null,
};

export const mockBanners: Banner[] = [
  { id: "b1", title: "Glow squad — colección primavera", subtitle: "Descubrí tus nuevos imprescindibles", cta_label: "Comprar ahora", image_url: "", link: "/colecciones/primavera", position: 0, active: true, slot: "hero",   created_at: now, ...heroExtra },
  { id: "b2", title: "Editorial: rituales de noche",     subtitle: null,                                   cta_label: null,            image_url: "", link: "/blog/rituales",         position: 0, active: true, slot: "mosaic", created_at: now, ...noHeroExtra },
  { id: "b3", title: "Labios que matan",                 subtitle: null,                                   cta_label: null,            image_url: "", link: "/c/labios",              position: 1, active: true, slot: "mosaic", created_at: now, ...noHeroExtra },
  { id: "b4", title: "Mirada que mata",                  subtitle: null,                                   cta_label: null,            image_url: "", link: "/c/ojos",                position: 2, active: true, slot: "mosaic", created_at: now, ...noHeroExtra },
];

const brand = (name: string, font_style: string, position: number): Brand => ({
  id: `brand-${position}`,
  name,
  logo_url: null,
  font_style,
  position,
  active: true,
  created_at: now,
});

export const mockBrands: Brand[] = [
  brand("Lumière", "serif-italic", 0),
  brand("GLOSSY", "display-bold", 1),
  brand("petal & co", "sans-wide", 2),
  brand("Aurora", "display-italic", 3),
  brand("BLOOM", "sans-black", 4),
  brand("Sunkissed", "display-semibold", 5),
  brand("MIRA", "sans-thin", 6),
  brand("Rosé Lab", "display-bold-italic", 7),
];

export const mockFlashSale: FlashSale = {
  id: 1,
  active: true,
  title: "Flash sale 24hs",
  discount_label: "-40% OFF",
  description: "En selección de cuidado facial y labiales. Sin código, descuento aplicado al carrito.",
  cta_link: "/ofertas",
  ends_at: null, // null => rolling 24h countdown in the component
  updated_at: now,
};

export const mockNews: News[] = [
  { id: "n1", text: "✨ Envío gratis en compras +$50",          active: true, position: 0, created_at: now },
  { id: "n2", text: "💖 10% off en tu primera compra",          active: true, position: 1, created_at: now },
  { id: "n3", text: "💸 Hasta 12 cuotas sin interés",            active: true, position: 2, created_at: now },
  { id: "n4", text: "🎁 Regalo sorpresa en compras +$100",      active: true, position: 3, created_at: now },
  { id: "n5", text: "💌 Suscribite y obtené 10% extra",          active: true, position: 4, created_at: now },
];
