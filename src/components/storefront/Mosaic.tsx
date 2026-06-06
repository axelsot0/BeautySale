import { ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/data/types";

export function Mosaic({
  banners,
  eyebrow,
  title,
}: {
  banners: Banner[];
  eyebrow: string;
  title: string;
}) {
  if (banners.length === 0) return null;

  const main = banners[0];
  const rest = banners.slice(1, 3);

  return (
    <section className="py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-6 md:mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-pink">{eyebrow}</p>
          <h2 className="font-display text-3xl md:text-5xl mt-1">{title}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-4 md:gap-6 h-[600px] md:h-[520px]">
          <a
            href={main.link ?? "#"}
            className="col-span-2 row-span-2 relative overflow-hidden rounded-[28px] bg-lavender p-6 md:p-10 group transition hover:-translate-y-0.5"
          >
            <div className="absolute -bottom-12 -right-12 text-[280px] leading-none opacity-20 select-none">
              💄
            </div>
            <div className="relative h-full flex flex-col justify-end gap-3 max-w-md">
              <span className="inline-block w-fit rounded-full bg-cream px-3 py-1 text-xs font-bold text-plum">
                Editorial
              </span>
              <h3 className="font-display text-3xl md:text-5xl leading-tight text-plum">
                {main.title}
              </h3>
              {main.subtitle && (
                <p className="text-plum/80 text-base md:text-lg">{main.subtitle}</p>
              )}
              <span className="inline-flex items-center gap-1.5 font-semibold text-plum group-hover:text-pink transition">
                Descubrir <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </a>

          {rest.map((b, idx) => (
            <a
              key={b.id}
              href={b.link ?? "#"}
              className="relative overflow-hidden rounded-[24px] p-5 md:p-6 group transition hover:-translate-y-0.5"
              style={{ backgroundColor: idx === 0 ? "#FFE066" : "#FFB3CC" }}
            >
              <div className="absolute -bottom-6 -right-6 text-[140px] leading-none opacity-20 select-none">
                {idx === 0 ? "💋" : "👁️"}
              </div>
              <div className="relative h-full flex flex-col justify-end gap-2">
                <h3 className="font-display text-2xl md:text-3xl leading-tight text-plum">
                  {b.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 font-semibold text-plum group-hover:text-pink transition">
                  Comprar <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
