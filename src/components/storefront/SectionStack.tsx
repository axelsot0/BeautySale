import { ArrowRight } from "lucide-react";
import type { Section } from "@/lib/data/sections-query";
import type { SectionConfig } from "@/lib/sections";
import {
  getCategories,
  getProductsByCategory,
  getFeaturedProducts,
  getBanners,
  getActiveFlashSale,
  getBrands,
} from "@/lib/data/queries";
import { TopSellers } from "./TopSellers";
import { ProductCarousel } from "./ProductCarousel";
import { Mosaic } from "./Mosaic";
import { FlashSale } from "./FlashSale";
import { BrandStrip } from "./BrandStrip";
import { NewsletterForm } from "./NewsletterForm";

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

    case "newsletter":
      return (
        <section className="py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-4 md:px-8 text-center space-y-4">
            {c.title && <h2 className="font-display text-3xl md:text-5xl">{c.title}</h2>}
            {c.subtitle && <p className="text-plum-soft">{c.subtitle}</p>}
            <NewsletterForm />
          </div>
        </section>
      );

    default:
      return null;
  }
}

export async function SectionStack({
  sections,
  tenantId,
}: {
  sections: Section[];
  tenantId: number;
}) {
  return (
    <>
      {sections.map((s) => (
        <RenderSection key={s.id} section={s} tenantId={tenantId} />
      ))}
    </>
  );
}
