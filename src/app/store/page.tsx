import { NewsBar } from "@/components/storefront/NewsBar";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { Hero } from "@/components/storefront/Hero";
import { CategoryChips } from "@/components/storefront/CategoryChips";
import { TopSellers } from "@/components/storefront/TopSellers";
import { ProductCarousel } from "@/components/storefront/ProductCarousel";
import { Mosaic } from "@/components/storefront/Mosaic";
import { FlashSale } from "@/components/storefront/FlashSale";
import { BrandStrip } from "@/components/storefront/BrandStrip";
import { Footer } from "@/components/storefront/Footer";
import {
  getCategories,
  getNews,
  getBanners,
  getFeaturedProducts,
  getProductsByCategory,
  getActiveFlashSale,
  getBrands,
  getEditorialHeading,
} from "@/lib/data/queries";
import { getActiveTheme, getFooterConfig, getNewsletterConfig } from "@/lib/data/theme-query";
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { getTenantStatus } from "@/lib/demo-server";
import { canEditStorefront } from "@/lib/edit-access";
import { getSections } from "@/lib/data/sections-query";
import { SectionStack } from "@/components/storefront/SectionStack";
import { DemoWatermark } from "@/components/storefront/DemoWatermark";
import { EditModeProvider } from "@/components/storefront/edit/EditMode";
import { Editable, type EditableField } from "@/components/storefront/edit/Editable";
import { HeaderEdit, NewsEdit, FooterEdit } from "@/components/storefront/edit/RegionEditors";
import type { Banner } from "@/lib/data/types";

export const dynamic = "force-dynamic";

function heroFields(b: Banner): EditableField[] {
  return [
    { name: "eyebrow_text", label: "Etiqueta superior", value: b.eyebrow_text ?? "" },
    { name: "title", label: "Título", value: b.title },
    { name: "subtitle", label: "Subtítulo", value: b.subtitle ?? "", type: "textarea" },
    { name: "cta_label", label: "Botón principal", value: b.cta_label ?? "" },
    { name: "link", label: "Link del botón", value: b.link ?? "" },
    { name: "cta2_label", label: "Botón secundario", value: b.cta2_label ?? "" },
    { name: "cta2_link", label: "Link secundario", value: b.cta2_link ?? "" },
    { name: "marquee_text", label: "Texto marquesina", value: b.marquee_text ?? "" },
  ];
}

export default async function Home() {
  const t = await getStorefrontTenantId();
  const [{ isDemo }, canEdit, sections] = await Promise.all([
    getTenantStatus(t),
    canEditStorefront(t),
    getSections(t),
  ]);

  const [news, heroBanners, theme, footerCfg, nlCfg] = await Promise.all([
    getNews(t),
    getBanners("hero", t),
    canEdit ? getActiveTheme(t) : null,
    canEdit ? getFooterConfig(t) : null,
    canEdit ? getNewsletterConfig(t) : null,
  ]);
  const heroBanner = heroBanners[0] ?? null;

  // Regiones fijas, editables en modo edición
  const newsBarNode = canEdit ? (
    <NewsEdit items={news.map((n) => n.text)}>
      <NewsBar items={news} />
    </NewsEdit>
  ) : (
    <NewsBar items={news} />
  );

  const headerNode =
    canEdit && theme ? (
      <HeaderEdit siteName={theme.siteName} navLinks={theme.navLinks}>
        <SiteHeader />
      </HeaderEdit>
    ) : (
      <SiteHeader />
    );

  const footerNode =
    canEdit && footerCfg && nlCfg ? (
      <FooterEdit
        description={footerCfg.description}
        contact={footerCfg.contact}
        nosotros={footerCfg.nosotros}
        payments={footerCfg.payments}
        newsletterTitle={nlCfg.title}
        newsletterSubtitle={nlCfg.subtitle}
      >
        <Footer />
      </FooterEdit>
    ) : (
      <Footer />
    );

  const heroNode = heroBanner && (
    canEdit ? (
      <Editable title="Hero" kind="hero" id={heroBanner.id} fields={heroFields(heroBanner)}>
        <Hero banner={heroBanner} />
      </Editable>
    ) : (
      <Hero banner={heroBanner} />
    )
  );

  let content: React.ReactNode;

  if (sections.length > 0) {
    content = (
      <>
        {isDemo && <DemoWatermark />}
        {newsBarNode}
        {headerNode}
        <main className="flex-1">
          {heroNode}
          <SectionStack sections={sections} tenantId={t} editable={canEdit} />
        </main>
        {footerNode}
      </>
    );
  } else {
    const [categories, mosaicBanners, featured, cuidado, ojos, flashSale, brands] =
      await Promise.all([
        getCategories(t),
        getBanners("mosaic", t),
        getFeaturedProducts(8, t),
        getProductsByCategory("cuidado-personal", 6, t),
        getProductsByCategory("ojos", 6, t),
        getActiveFlashSale(t),
        getBrands(t),
      ]);
    const editorial = await getEditorialHeading(t);

    const cuidadoCat = categories.find((c) => c.slug === "cuidado-personal");
    const ojosCat = categories.find((c) => c.slug === "ojos");

    const mosaic = (
      <Mosaic banners={mosaicBanners} eyebrow={editorial.eyebrow} title={editorial.title} />
    );

    content = (
      <>
        {isDemo && <DemoWatermark />}
        {newsBarNode}
        {headerNode}
        <main className="flex-1">
          {heroNode}
          <CategoryChips categories={categories} />
          <TopSellers products={featured} />
          {cuidadoCat && (
            <ProductCarousel
              category={cuidadoCat}
              products={cuidado}
              eyebrow="💆‍♀️ cuidado personal"
              title={<>Tu ritual diario <span className="italic">💆‍♀️</span></>}
              bgClass="bg-mint-soft"
            />
          )}
          {canEdit ? (
            <Editable
              title="Editorial"
              kind="editorial"
              fields={[
                { name: "eyebrow", label: "Etiqueta superior", value: editorial.eyebrow },
                { name: "title", label: "Título", value: editorial.title },
              ]}
            >
              {mosaic}
            </Editable>
          ) : (
            mosaic
          )}
          {ojosCat && (
            <ProductCarousel
              category={ojosCat}
              products={ojos}
              eyebrow="👁️ ojos"
              title={<>Mirada que <span className="italic text-pink">mata</span> 👁️</>}
              bgClass="bg-lavender-soft"
            />
          )}
          {flashSale && <FlashSale data={flashSale} />}
          <BrandStrip brands={brands} />
        </main>
        {footerNode}
      </>
    );
  }

  return canEdit ? <EditModeProvider>{content}</EditModeProvider> : content;
}
