import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/lib/data/types";

export function ProductCarousel({
  category,
  products,
  eyebrow,
  title,
  bgClass = "bg-mint-soft",
}: {
  category: Category;
  products: Product[];
  eyebrow: string;
  title: React.ReactNode;
  bgClass?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className={cn("py-10 md:py-16", bgClass)}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-pink">
              {eyebrow}
            </p>
            <h2 className="font-display text-3xl md:text-5xl mt-1">{title}</h2>
          </div>
          <a
            href={`/c/${category.slug}`}
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream hover:bg-pink transition"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="snap-x-soft no-scrollbar flex gap-4 md:gap-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {products.map((p) => (
            <div key={p.id} className="shrink-0 w-[68%] sm:w-[44%] md:w-[calc(25%-1.125rem)]">
              <ProductCard product={p} />
            </div>
          ))}
          <a
            href={`/c/${category.slug}`}
            className="shrink-0 grid w-[60%] sm:w-[40%] md:w-[calc(25%-1.125rem)] place-items-center rounded-[24px] border-2 border-dashed border-plum/30 hover:border-pink hover:bg-cream transition group"
          >
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-pink text-cream group-hover:scale-110 transition">
                <ArrowRight className="h-5 w-5" />
              </div>
              <p className="font-display text-xl text-plum">Ver toda la categoría</p>
              <p className="text-sm text-plum-soft">{category.name}</p>
            </div>
          </a>
        </div>

        <a
          href={`/c/${category.slug}`}
          className="md:hidden mt-6 block rounded-full bg-plum px-5 py-3 text-center text-sm font-semibold text-cream"
        >
          Ver todos los productos
        </a>
      </div>
    </section>
  );
}
