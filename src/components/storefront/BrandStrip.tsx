import type { Brand } from "@/lib/data/types";
import { brandClass } from "@/lib/brand-styles";

export function BrandStrip({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;
  const loop = [...brands, ...brands];

  return (
    <section className="py-8 md:py-10 border-y border-plum/10 group">
      <div className="overflow-hidden">
        <div className="flex items-center gap-12 md:gap-16 animate-marquee whitespace-nowrap text-2xl md:text-3xl text-plum-soft group-hover:text-plum transition-colors">
          {loop.map((b, i) =>
            b.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${b.id}-${i}`}
                src={b.logo_url}
                alt={b.name}
                className="h-8 md:h-10 w-auto object-contain shrink-0 opacity-70 group-hover:opacity-100 transition"
              />
            ) : (
              <span key={`${b.id}-${i}`} className={brandClass(b.font_style)}>
                {b.name}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
