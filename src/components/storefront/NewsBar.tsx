import type { News } from "@/lib/data/types";

export function NewsBar({ items }: { items: News[] }) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden bg-plum text-cream py-2.5 text-sm">
      <div className="flex animate-marquee whitespace-nowrap">
        {[0, 1].map((g) => (
          <div key={g} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={g === 1}>
            {items.map((item) => (
              <span key={item.id} className="flex items-center gap-3 font-medium tracking-wide">
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
