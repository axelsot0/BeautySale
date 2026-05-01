import { NewsBar } from "@/components/storefront/NewsBar";
import { Header } from "@/components/storefront/Header";
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
} from "@/lib/data/queries";

export const revalidate = 60;

export default async function Home() {
  const [news, categories, mosaicBanners, featured, cuidado, ojos] = await Promise.all([
    getNews(),
    getCategories(),
    getBanners("mosaic"),
    getFeaturedProducts(8),
    getProductsByCategory("cuidado-personal", 6),
    getProductsByCategory("ojos", 6),
  ]);

  const cuidadoCat = categories.find((c) => c.slug === "cuidado-personal");
  const ojosCat = categories.find((c) => c.slug === "ojos");

  return (
    <>
      <NewsBar items={news} />
      <Header />
      <main className="flex-1">
        <Hero />
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
        <Mosaic banners={mosaicBanners} />
        {ojosCat && (
          <ProductCarousel
            category={ojosCat}
            products={ojos}
            eyebrow="👁️ ojos"
            title={<>Mirada que <span className="italic text-pink">mata</span> 👁️</>}
            bgClass="bg-lavender-soft"
          />
        )}
        <FlashSale />
        <BrandStrip />
      </main>
      <Footer />
    </>
  );
}
