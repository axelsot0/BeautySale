import type { Product } from "@/lib/data/types";
import { getDict } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { ProductCard } from "./ProductCard";

export async function TopSellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const t = getDict(await getServerLocale());

  return (
    <section className="py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-pink">
              {t.top_eyebrow}
            </p>
            <h2 className="font-display text-3xl md:text-5xl mt-1">
              {t.top_title} <span className="italic text-pink">💖</span>
            </h2>
            <p className="text-plum-soft mt-1">{t.top_subtitle}</p>
          </div>
          <a href="/destacados" className="hidden md:inline-flex rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream hover:bg-pink transition">
            {t.view_all}
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <a
          href="/destacados"
          className="md:hidden mt-6 block rounded-full bg-plum px-5 py-3 text-center text-sm font-semibold text-cream"
        >
          {t.view_all_featured}
        </a>
      </div>
    </section>
  );
}
