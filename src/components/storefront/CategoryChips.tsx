import type { Category } from "@/lib/data/types";

export function CategoryChips({
  categories,
  productCounts = {},
}: {
  categories: Category[];
  productCounts?: Record<string, number>;
}) {
  return (
    <section id="categorias" className="py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-pink">
              💖 categorías
            </p>
            <h2 className="font-display text-3xl md:text-5xl mt-1">
              Encontrá lo tuyo
            </h2>
          </div>
        </div>

        <div className="snap-x-soft no-scrollbar flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/c/${c.slug}`}
              className="group shrink-0 flex flex-col items-center gap-2 rounded-[28px] p-4 w-32 md:w-40 transition hover:-translate-y-1"
              style={{ backgroundColor: c.color }}
            >
              <div className="grid h-16 w-16 md:h-20 md:w-20 place-items-center rounded-full bg-cream text-3xl md:text-4xl shadow-[0_8px_16px_rgba(45,27,78,0.08)] group-hover:scale-110 transition">
                {c.icon ?? "✨"}
              </div>
              <p className="font-display text-sm md:text-base text-plum text-center leading-tight">
                {c.name}
              </p>
              <p className="text-xs text-plum/60">
                {productCounts[c.id] ?? "+"} productos
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
