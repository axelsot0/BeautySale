import type { News } from "@/lib/data/types";

export function NewsBar({ items }: { items: News[] }) {
  if (items.length === 0) return null;

  // Duplicate to avoid empty space on loop.
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden bg-plum text-cream py-2.5 text-sm">
      <div className="flex gap-10 animate-marquee whitespace-nowrap">
        {loop.map((item, i) => (
          <span key={`${item.id}-${i}`} className="flex items-center gap-3 font-medium tracking-wide">
            {item.text}
            <span className="text-pink">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
