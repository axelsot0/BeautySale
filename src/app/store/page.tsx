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
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { getTenantStatus } from "@/lib/demo-server";
import { getSections } from "@/lib/data/sections-query";
import { SectionStack } from "@/components/storefront/SectionStack";
import { DemoWatermark } from "@/components/storefront/DemoWatermark";

export const dynamic = "force-dynamic";

export default async function Home() {
  const t = await getStorefrontTenantId();
  const { isDemo } = await getTenantStatus(t);

  // If the store has a custom section stack, render it (Hero on top, footer at
  // the bottom). Otherwise fall back to the built-in default layout.
  const sections = await getSections(t);
  if (sections.length > 0) {
    const [news, heroBanners] = await Promise.all([getNews(t), getBanners("hero", t)]);
    const heroBanner = heroBanners[0] ?? null;
    return (
      <>
        {isDemo && <DemoWatermark />}
        <NewsBar items={news} />
        <SiteHeader />
        <main className="flex-1">
          {heroBanner && <Hero banner={heroBanner} />}
          <SectionStack sections={sections} tenantId={t} />
        </main>
        <Footer />
      </>
    );
  }
  const [news, categories, heroBanners, mosaicBanners, featured, cuidado, ojos, flashSale, brands] =
    await Promise.all([
      getNews(t),
      getCategories(t),
      getBanners("hero", t),
      getBanners("mosaic", t),
      getFeaturedProducts(8, t),
      getProductsByCategory("cuidado-personal", 6, t),
      getProductsByCategory("ojos", 6, t),
      getActiveFlashSale(t),
      getBrands(t),
    ]);
  const heroBanner = heroBanners[0] ?? null;
  const editorial = await getEditorialHeading(t);

  const cuidadoCat = categories.find((c) => c.slug === "cuidado-personal");
  const ojosCat = categories.find((c) => c.slug === "ojos");

  return (
    <>
      {isDemo && <DemoWatermark />}
      <NewsBar items={news} />
      <SiteHeader />
      <main className="flex-1">
        {heroBanner && <Hero banner={heroBanner} />}
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
        <Mosaic banners={mosaicBanners} eyebrow={editorial.eyebrow} title={editorial.title} />
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
      <Footer />
    </>
  );
}
