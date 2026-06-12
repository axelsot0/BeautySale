// Seed de la tienda demo BeautySale (tenant 1) vía service role.
// Uso: node scripts/seed-demo.mjs
// Re-ejecutable: borra el contenido del tenant y lo vuelve a insertar.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const tid = 1;

function die(step, error) {
  if (error) {
    console.error(`[${step}]`, error.message);
    process.exit(1);
  }
}

// ── Limpiar ──────────────────────────────────────────────────────────────────
for (const table of ["news", "brands", "flash_sale", "banners", "products", "categories", "sections"]) {
  const { error } = await db.from(table).delete().eq("tenant_id", tid);
  die(`delete ${table}`, error);
}

// ── Tienda ───────────────────────────────────────────────────────────────────
{
  const { error } = await db
    .from("tenants")
    .update({
      site_name: "Beauty Sale",
      demo_mode: false,
      newsletter_title: "Unite a nuestro club",
      newsletter_subtitle:
        "Obtené 10% OFF en tu primera compra más acceso exclusivo a lanzamientos y ofertas.",
      newsletter_discount_pct: 10,
    })
    .eq("id", tid);
  die("update tenant", error);
}

// ── Ticker ───────────────────────────────────────────────────────────────────
{
  const texts = [
    "Envío gratis en compras superiores a $50",
    "10% de descuento en tu primera compra",
    "Hasta 12 cuotas sin interés con tarjeta",
    "Regalo sorpresa en pedidos mayores a $100",
    "Suscribite al newsletter y recibí código de descuento",
  ];
  const { error } = await db
    .from("news")
    .insert(texts.map((text, position) => ({ tenant_id: tid, text, active: true, position })));
  die("news", error);
}

// ── Categorías ───────────────────────────────────────────────────────────────
// id es uuid autogenerado; mapeamos slug -> id para los productos.
const catId = {};
{
  const cats = [
    ["Skincare", "skincare", "#7DD3C0", "✨"],
    ["Labios", "labios", "#FF4D8B", "💋"],
    ["Ojos", "ojos", "#B5A3E8", "👁"],
    ["Rostro", "rostro", "#FFE066", "🌟"],
    ["Cabello", "cabello", "#E5DEFF", "💁"],
    ["Cuidado corporal", "cuidado-corporal", "#CFEFE6", "🧴"],
    ["Uñas", "unas", "#FFB3CC", "💅"],
    ["Fragancias", "fragancias", "#FFF3B0", "🌸"],
  ];
  const { data, error } = await db
    .from("categories")
    .insert(
      cats.map(([name, slug, color, icon], position) => ({
        tenant_id: tid, name, slug, color, icon, position,
      })),
    )
    .select("id, slug");
  die("categories", error);
  for (const c of data) catId[c.slug] = c.id;
}

// ── Productos ────────────────────────────────────────────────────────────────
const U = (id) => `https://images.unsplash.com/${id}?w=600&q=80`;
const TAG = {
  "cat-skincare": "skincare", "cat-labios": "labios", "cat-ojos": "ojos",
  "cat-rostro": "rostro", "cat-cabello": "cabello", "cat-cuerpo": "cuidado-corporal",
  "cat-unas": "unas", "cat-fragancias": "fragancias",
};
const P = (title, slug, description, price, discount, stock, cat, featured, onSale, imgs) => ({
  tenant_id: tid, title, slug, description, price,
  discount_percent: discount, stock, category_id: catId[TAG[cat]],
  featured, on_sale: onSale, images: imgs.map(U),
});

const products = [
  // Skincare
  P("Sérum vitamina C glow 30 ml", "serum-vitamina-c-glow",
    "Sérum de alta concentración con vitamina C estabilizada al 15%, niacinamida y ácido hialurónico. Unifica el tono, ilumina y reduce manchas visibles en 4 semanas.",
    24.99, 20, 40, "cat-skincare", true, true,
    ["photo-1620916566398-39f1143ab7be", "photo-1556228578-8c89e6adf883"]),
  P("Crema hidratante 24h con ácido hialurónico", "crema-hidratante-24h",
    "Crema de textura ligera con ácido hialurónico de triple peso molecular. Hidratación intensa hasta 24 horas y barrera cutánea fortalecida. Sin parabenos.",
    19.5, 0, 55, "cat-skincare", true, false, ["photo-1601049676869-702ea24cfd58"]),
  P("Mascarilla detox arcilla negra", "mascarilla-detox-arcilla-negra",
    "Mascarilla semanal con arcilla negra volcánica, carbón activado y árbol de té. Limpia profundo, reduce poros y controla el sebo sin resecar.",
    14.2, 0, 30, "cat-skincare", true, false, ["photo-1556228453-efd6c1ff04f6"]),
  P("Protector solar SPF 50+ tono uniforme", "protector-solar-spf50",
    "Protector de amplio espectro SPF 50+ con acabado mate y tono unificador. No grasoso, apto bajo maquillaje, resistente al agua.",
    18, 15, 45, "cat-skincare", false, true, ["photo-1588776814546-daab30f310ce"]),
  P("Sérum retinol anti-edad 0.5%", "serum-retinol-anti-edad",
    "Retinol encapsulado al 0.5% con péptidos de cobre y vitamina E. Minimiza líneas finas y aporta firmeza progresiva. Uso nocturno.",
    32, 0, 25, "cat-skincare", false, false, ["photo-1601049676869-702ea24cfd58"]),
  P("Agua micelar 3 en 1 400 ml", "agua-micelar-3en1",
    "Desmaquilla, limpia y tonifica en un solo paso. Micelas suaves que arrastran impurezas sin frotar. Apta para ojos sensibles y lentes de contacto.",
    9.99, 0, 70, "cat-skincare", false, false, ["photo-1556228720-195a672e8a03"]),
  // Labios
  P("Labial mate cherry pop", "labial-mate-cherry-pop",
    "Labial líquido ultramatte en tono cereza vibrante. Transferencia mínima y duración de hasta 8 horas. Con vitamina E, no reseca.",
    12, 30, 60, "cat-labios", true, true,
    ["photo-1631214503851-25e91e56c8e0", "photo-1586495985010-c4e2772b8a30"]),
  P("Bálsamo labial hidratante miel", "balsamo-labial-miel",
    "Bálsamo nutritivo con manteca de karité, coco y miel. Repara labios secos, brillo natural y protección UV ligera.",
    6.5, 0, 80, "cat-labios", true, false, ["photo-1512207736890-6ffed8a84e8d"]),
  P("Gloss voluminizador nude rose", "gloss-voluminizador-nude",
    "Gloss con efecto voluminizador de jengibre. Tono nude rosado universal, acabado brillante no pegajoso.",
    10.9, 0, 50, "cat-labios", false, false, ["photo-1586495985010-c4e2772b8a30"]),
  P("Kit delineador + labial nude", "kit-delineador-labial-nude",
    "Dúo perfecto: delineador cremoso de larga duración + labial nude satinado a juego. Presentación ideal para regalo.",
    15.9, 10, 35, "cat-labios", false, true, ["photo-1631214503851-25e91e56c8e0"]),
  // Ojos
  P("Paleta sombras sunset 12 tonos", "paleta-sombras-sunset",
    "12 sombras matte, shimmer y glitter en tonos cálidos del terracota al dorado. Alta pigmentación, incluye espejo y aplicador.",
    29.9, 0, 35, "cat-ojos", true, false,
    ["photo-1512207736890-6ffed8a84e8d", "photo-1503236823255-94609f598e71"]),
  P("Máscara de pestañas volumen extremo", "mascara-volumen-extremo",
    "Cepillo cónico y fórmula de polímeros: volumen y longitud en una pasada, efecto pestañas postizas sin grumos. Waterproof.",
    13.2, 0, 55, "cat-ojos", true, false, ["photo-1631214524020-3c69d03c6a87"]),
  P("Delineador líquido negro fino", "delineador-liquido-negro",
    "Punta ultra fina 0.1 mm, tinta de secado rápido intensamente negra. Resistente al agua, ideal para cat eye.",
    9.9, 15, 65, "cat-ojos", true, true, ["photo-1631214524020-3c69d03c6a87"]),
  P("Cejas en gel fijación 24h", "gel-cejas-fijacion",
    "Gel transparente con fibras que peina, fija y da volumen a las cejas todo el día. Fórmula flexible, no deja residuo blanco.",
    8.5, 0, 45, "cat-ojos", false, false, ["photo-1503236823255-94609f598e71"]),
  // Rostro
  P("Base fluida cobertura natural SPF 20", "base-fluida-cobertura-natural",
    "Cobertura media a completa con acabado piel desnuda. SPF 20, aloe vera y pigmentos HD. 10 tonos, duración 16 h.",
    27, 0, 40, "cat-rostro", true, false, ["photo-1522335789203-aabd1fc54bc9"]),
  P("Iluminador en polvo aurora rosada", "iluminador-aurora-rosada",
    "Polvo compacto con perlados rosa champagne. Reflejo dimensional y mezcla perfecta en todas las pieles.",
    16.5, 0, 45, "cat-rostro", false, false, ["photo-1522335789203-aabd1fc54bc9"]),
  P("Rubor cremoso melocotón", "rubor-cremoso-melocoton",
    "Textura crema-a-polvo que se funde con la piel. Tono melocotón cálido buildable, acabado luminoso natural.",
    13.5, 20, 50, "cat-rostro", false, true, ["photo-1596462502278-27bfdc403348"]),
  // Cabello
  P("Aceite de argán nutritivo 100 ml", "aceite-argan-nutritivo",
    "Argán marroquí 100% puro prensado en frío. Brillo espejo y control del frizz sin pesar. Uso en seco o húmedo.",
    21, 0, 30, "cat-cabello", false, false, ["photo-1522337360788-8b13dee7a37e"]),
  P("Mascarilla capilar reconstrucción", "mascarilla-capilar-reconstruccion",
    "Proteína de seda, queratina y manteca de mango. Reconstruye fibra dañada y aporta suavidad duradera.",
    17.5, 20, 35, "cat-cabello", false, true, ["photo-1522337360788-8b13dee7a37e"]),
  P("Shampoo sólido coco y karité", "shampoo-solido-coco",
    "Barra sólida equivalente a 2 botellas de shampoo líquido. Limpieza suave sin sulfatos, espuma cremosa. Eco-friendly.",
    11, 0, 60, "cat-cabello", false, false, ["photo-1535585209827-a15fcdbc4c2d"]),
  // Cuerpo
  P("Crema corporal manteca de karité", "crema-corporal-karite",
    "Textura rica con karité etíope, almendras dulces y vitamina E. Hidratación 48 h, fragancia vainilla bourbon.",
    16, 0, 50, "cat-cuerpo", true, false, ["photo-1608248597279-f99d160bfcbc"]),
  P("Exfoliante corporal azúcar y mango", "exfoliante-azucar-mango",
    "Exfoliante azucarado con mango y papaya. Elimina células muertas, suaviza e hidrata. Aroma tropical, sin sulfatos.",
    13, 25, 40, "cat-cuerpo", false, true, ["photo-1608248597279-f99d160bfcbc"]),
  // Uñas
  P("Esmalte gel efecto vinilo rojo", "esmalte-gel-vinilo-rojo",
    "Esmalte gel de secado al aire con acabado vinilo de alto brillo. Hasta 10 días de duración sin lámpara UV.",
    7.9, 0, 70, "cat-unas", true, false, ["photo-1604654894610-df63bc536371"]),
  P("Kit manicure profesional 12 piezas", "kit-manicure-profesional",
    "Set completo en acero inoxidable: cortaúñas, tijeras, empujador, limas y más, en estuche de viaje de cuero vegano.",
    19.9, 15, 30, "cat-unas", false, true, ["photo-1604654894610-df63bc536371"]),
  P("Aceite de cutículas almendra", "aceite-cuticulas-almendra",
    "Pincel aplicador con aceite de almendras, jojoba y vitamina E. Cutículas suaves y uñas fortalecidas en 2 semanas.",
    6.9, 0, 55, "cat-unas", false, false, ["photo-1610992015732-2449b76344bc"]),
  // Fragancias
  P("Body mist rosas y almendras 200 ml", "body-mist-rosas-almendras",
    "Agua perfumada con rosas frescas, almendras dulces y sándalo. Duración 4-6 h, libre de alcohol.",
    11.5, 0, 60, "cat-fragancias", true, false, ["photo-1541643600914-78b084683702"]),
  P("Eau de parfum flor de cerezo 50 ml", "edp-flor-cerezo",
    "Notas de salida de cerezo y pera, corazón de peonía y fondo ámbar. Femenino, fresco y duradero (8 h+).",
    34.9, 10, 25, "cat-fragancias", false, true, ["photo-1541643600914-78b084683702"]),
  P("Vela aromática vainilla y coco", "vela-aromatica-vainilla-coco",
    "Cera de soja con aceites esenciales de vainilla bourbon y coco. 45 horas de quemado, mecha de algodón.",
    14.5, 0, 40, "cat-fragancias", false, false, ["photo-1602874801006-e26c4c5b5e8a"]),
];
{
  const { error } = await db.from("products").insert(products);
  die("products", error);
}

// ── Banners ──────────────────────────────────────────────────────────────────
{
  const { error } = await db.from("banners").insert([
    {
      tenant_id: tid, slot: "hero", position: 0, active: true,
      title: "Tu rutina de belleza, reinventada",
      subtitle: "Skincare, maquillaje y cuidado corporal con ingredientes que realmente funcionan.",
      cta_label: "Comprar ahora", link: "/productos",
      image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&q=85",
      eyebrow_text: "Nueva colección", eyebrow_color: "#FFE066",
      cta2_label: "Ver categorías", cta2_link: "/productos",
      marquee_text: "NUEVO",
    },
    {
      tenant_id: tid, slot: "mosaic", position: 0, active: true,
      title: "Rituales de cuidado nocturno",
      subtitle: "La piel se regenera mientras dormís. Descubrí nuestra rutina de noche.",
      link: "/c/skincare",
      image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
    },
    {
      tenant_id: tid, slot: "mosaic", position: 1, active: true,
      title: "Labios que hablan por vos",
      subtitle: "Tonos que duran todo el día, desde el brunch hasta la noche.",
      link: "/c/labios",
      image_url: "https://images.unsplash.com/photo-1631214503851-25e91e56c8e0?w=800&q=80",
    },
    {
      tenant_id: tid, slot: "mosaic", position: 2, active: true,
      title: "Mirada poderosa",
      subtitle: "Paletas, máscaras y delineadores para cada look.",
      link: "/c/ojos",
      image_url: "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=800&q=80",
    },
  ]);
  die("banners", error);
}

// ── Marcas ───────────────────────────────────────────────────────────────────
{
  const brands = [
    ["Lumière", "serif-italic"], ["GLOSSY", "display-bold"], ["petal & co", "sans-wide"],
    ["Aurora", "display-italic"], ["BLOOM", "sans-black"], ["Sunkissed", "display-semibold"],
    ["MIRA", "sans-thin"], ["Rosé Lab", "display-bold-italic"],
  ];
  const { error } = await db.from("brands").insert(
    brands.map(([name, font_style], position) => ({
      tenant_id: tid, name, font_style, position, active: true, logo_url: null,
    })),
  );
  die("brands", error);
}

// ── Flash sale ───────────────────────────────────────────────────────────────
{
  const { error } = await db.from("flash_sale").insert({
    tenant_id: tid, active: true,
    title: "Flash Sale — Solo hoy",
    discount_label: "-30% OFF",
    description: "En toda la línea de skincare y labiales seleccionados. Descuento aplicado automáticamente.",
    cta_link: "/ofertas", ends_at: null,
  });
  die("flash_sale", error);
}

// ── Secciones del home ───────────────────────────────────────────────────────
{
  const sections = [
    ["banner", { title: "Cuídate hoy", subtitle: "Rituales que marcan la diferencia", image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80", cta_label: "Ver productos", cta_link: "/productos", bg_color: "#FF4D8B" }],
    ["product_carousel", { source: "featured", eyebrow: "Lo más querido", title: "Bestsellers" }],
    ["product_carousel", { source: "category", category_slug: "skincare", eyebrow: "✨ skincare", title: "Tu ritual de cuidado" }],
    ["mosaic", { eyebrow: "Editoriales", title: "Inspiración para tu rutina" }],
    ["product_carousel", { source: "category", category_slug: "labios", eyebrow: "💋 labios", title: "Color que dura" }],
    ["flash_sale", {}],
    ["brand_strip", {}],
    ["newsletter", {}],
  ];
  const { error } = await db.from("sections").insert(
    sections.map(([type, config], position) => ({
      tenant_id: tid, type, position, active: true, config,
    })),
  );
  die("sections", error);
}

// ── Verificación ─────────────────────────────────────────────────────────────
for (const table of ["categories", "products", "banners", "news", "brands", "sections", "flash_sale"]) {
  const { count } = await db.from(table).select("*", { count: "exact", head: true }).eq("tenant_id", tid);
  console.log(`${table}: ${count}`);
}
console.log("Seed OK");
