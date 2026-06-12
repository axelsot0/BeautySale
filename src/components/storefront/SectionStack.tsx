import { ArrowRight } from "lucide-react";
import type { Section } from "@/lib/data/sections-query";
import { parseCustomBlocks, type SectionConfig } from "@/lib/sections";
import {
  getCategories,
  getProductsByCategory,
  getFeaturedProducts,
  getBanners,
  getActiveFlashSale,
  getBrands,
} from "@/lib/data/queries";
import { getNewsletterConfig } from "@/lib/data/theme-query";
import { TopSellers } from "./TopSellers";
import { ProductCarousel } from "./ProductCarousel";
import { Mosaic } from "./Mosaic";
import { FlashSale } from "./FlashSale";
import { BrandStrip } from "./BrandStrip";
import { NewsletterForm } from "./NewsletterForm";
import { Editable, type EditableField } from "./edit/Editable";
import { SectionDnD } from "./edit/SectionDnD";

// Campos editables inline por tipo de sección (modo edición).
function editFields(type: string, c: SectionConfig): EditableField[] | null {
  switch (type) {
    case "banner":
      return [
        { name: "title", label: "Título", value: c.title ?? "" },
        { name: "subtitle", label: "Subtítulo", value: c.subtitle ?? "", type: "textarea" },
        { name: "cta_label", label: "Texto del botón", value: c.cta_label ?? "" },
        { name: "cta_link", label: "Link del botón", value: c.cta_link ?? "" },
        { name: "bg_color", label: "Color de fondo", value: c.bg_color ?? "#FF4D8B", type: "color" },
      ];
    case "product_carousel":
      return [
        { name: "eyebrow", label: "Etiqueta superior", value: c.eyebrow ?? "" },
        { name: "title", label: "Título", value: c.title ?? "" },
      ];
    case "mosaic":
      return [
        { name: "eyebrow", label: "Etiqueta superior", value: c.eyebrow ?? "" },
        { name: "title", label: "Título", value: c.title ?? "" },
      ];
    default:
      return null;
  }
}

const SECTION_LABELS: Record<string, string> = {
  banner: "Banner",
  product_carousel: "Carrusel",
  mosaic: "Mosaico",
  newsletter: "Newsletter",
};

async function RenderSection({ section, tenantId }: { section: Section; tenantId: number }) {
  const c = (section.config ?? {}) as SectionConfig;

  switch (section.type) {
    case "banner": {
      const bg = c.bg_color || "#FF4D8B";
      return (
        <section className="py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div
              className="relative overflow-hidden rounded-[32px] px-8 py-14 md:px-14 md:py-20"
              style={{ backgroundColor: bg }}
            >
              {c.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
              )}
              <div className="relative max-w-xl text-cream">
                <h2 className="font-display text-4xl md:text-6xl leading-none drop-shadow">{c.title}</h2>
                {c.subtitle && <p className="mt-3 text-lg text-cream/90">{c.subtitle}</p>}
                {c.cta_label && (
                  <a
                    href={c.cta_link || "#"}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 font-semibold text-plum hover:opacity-90 transition"
                  >
                    {c.cta_label}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "product_carousel": {
      if (c.source === "category" && c.category_slug) {
        const [cats, products] = await Promise.all([
          getCategories(tenantId),
          getProductsByCategory(c.category_slug, 8, tenantId),
        ]);
        const cat = cats.find((x) => x.slug === c.category_slug);
        if (!cat) return null;
        return (
          <ProductCarousel
            category={cat}
            products={products}
            eyebrow={c.eyebrow || cat.name}
            title={c.title || cat.name}
          />
        );
      }
      const products = await getFeaturedProducts(8, tenantId);
      return <TopSellers products={products} />;
    }

    case "mosaic": {
      const banners = await getBanners("mosaic", tenantId);
      return <Mosaic banners={banners} eyebrow={c.eyebrow || "editorial"} title={c.title || "Explorá"} />;
    }

    case "flash_sale": {
      const flash = await getActiveFlashSale(tenantId);
      return flash ? <FlashSale data={flash} /> : null;
    }

    case "brand_strip": {
      const brands = await getBrands(tenantId);
      return <BrandStrip brands={brands} />;
    }

    case "newsletter": {
      const nl = await getNewsletterConfig(tenantId);
      return (
        <section className="py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-4 md:px-8 text-center space-y-4">
            <h2 className="font-display text-3xl md:text-5xl">{nl.title}</h2>
            {nl.subtitle && <p className="text-plum-soft">{nl.subtitle}</p>}
            <NewsletterForm title={nl.title} subtitle={nl.subtitle} discountPct={nl.discountPct} />
          </div>
        </section>
      );
    }

    case "custom": {
      const blocks = parseCustomBlocks(c.blocks_json);
      if (blocks.length === 0) return null;
      return (
        <section className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 md:px-8 space-y-6 text-center">
            {blocks.map((b, i) => {
              switch (b.kind) {
                case "heading":
                  return (
                    <h2 key={i} className="font-display text-3xl md:text-5xl leading-tight">
                      {b.text}
                    </h2>
                  );
                case "text":
                  return (
                    <p key={i} className="text-plum-soft text-lg leading-relaxed">
                      {b.text}
                    </p>
                  );
                case "image":
                  return b.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={b.url}
                      alt=""
                      className="w-full rounded-[28px] object-cover max-h-[480px]"
                    />
                  ) : null;
                case "button":
                  return (
                    <a
                      key={i}
                      href={b.link || "#"}
                      className="inline-flex items-center gap-2 rounded-full bg-pink px-7 py-3.5 font-bold text-cream hover:opacity-90 transition"
                    >
                      {b.label}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}

export async function SectionStack({
  sections,
  tenantId,
  editable = false,
}: {
  sections: Section[];
  tenantId: number;
  editable?: boolean;
}) {
  const nl =
    editable && sections.some((s) => s.type === "newsletter")
      ? await getNewsletterConfig(tenantId)
      : null;

  const items = sections.map((s) => {
    const node = <RenderSection key={s.id} section={s} tenantId={tenantId} />;
    if (!editable) return node;

    if (s.type === "newsletter" && nl) {
      return (
        <Editable
          key={s.id}
          title="Newsletter"
          kind="newsletter"
          fields={[
            { name: "title", label: "Título", value: nl.title },
            { name: "subtitle", label: "Subtítulo", value: nl.subtitle, type: "textarea" },
          ]}
        >
          <RenderSection section={s} tenantId={tenantId} />
        </Editable>
      );
    }

    const c = (s.config ?? {}) as SectionConfig;
    const f = editFields(s.type, c);
    if (!f) return node;
    return (
      <Editable
        key={s.id}
        title={SECTION_LABELS[s.type] ?? "Sección"}
        kind="section"
        id={s.id}
        fields={f}
      >
        <RenderSection section={s} tenantId={tenantId} />
      </Editable>
    );
  });

  if (!editable) return <>{items}</>;

  // Drag & drop para reubicar secciones (topbar y footer quedan fijos)
  return <SectionDnD ids={sections.map((s) => s.id)}>{items}</SectionDnD>;
}
