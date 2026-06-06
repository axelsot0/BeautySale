import type { News } from "@/lib/data/types";

export function NewsBar({ items }: { items: News[] }) {
  if (items.length === 0) return null;

  // Repeat items until each group has enough copies to fill any screen width
  const minCount = Math.ceil(12 / items.length);
  const repeated = Array.from({ length: minCount }, () => items).flat();

  return (
    <div className="overflow-hidden bg-plum text-cream py-2.5 text-sm">
      <div className="flex animate-marquee whitespace-nowrap">
        {[0, 1].map((g) => (
          <div key={g} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={g === 1}>
            {repeated.map((item, i) => (
              <span key={`${item.id}-${i}`} className="flex items-center gap-3 font-medium tracking-wide">
                {item.text}
                <span className="text-pink">●</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
