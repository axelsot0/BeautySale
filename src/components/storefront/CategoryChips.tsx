"use client";

import { useEffect, useRef } from "react";
import type { Category } from "@/lib/data/types";

const VISIBLE = 6; // cuántas caben sin scroll en desktop

export function CategoryChips({
  categories,
  productCounts = {},
}: {
  categories: Category[];
  productCounts?: Record<string, number>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const needsScroll = categories.length > VISIBLE;
  const isEmpty = categories.length === 0;

  // Auto-scroll suave cuando hay más categorías de las que caben
  useEffect(() => {
    if (!needsScroll) return;
    const track = trackRef.current;
    if (!track) return;

    let paused = false;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);
    track.addEventListener("touchstart", onEnter, { passive: true });
    track.addEventListener("touchend", onLeave);

    const id = setInterval(() => {
      if (paused || !track) return;
      const max = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= max) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: 180, behavior: "smooth" });
      }
    }, 2200);

    return () => {
      clearInterval(id);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
      track.removeEventListener("touchstart", onEnter);
      track.removeEventListener("touchend", onLeave);
    };
  }, [needsScroll]);

  if (isEmpty) return null;

  return (
    <section id="categorias" className="py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-pink">💖 categorías</p>
            <h2 className="font-display text-3xl md:text-5xl mt-1">Encontrá lo tuyo</h2>
          </div>
        </div>

        <div
          ref={trackRef}
          className="snap-x-soft no-scrollbar flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/c/${c.slug}`}
              className="group shrink-0 flex flex-col items-center gap-2 rounded-[28px] p-4 w-32 md:w-40 transition hover:-translate-y-1"
              style={{ backgroundColor: c.color }}
            >
              {/* Circle */}
              <div className="relative h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-full overflow-hidden bg-cream shadow-[0_8px_16px_rgba(45,27,78,0.1)] group-hover:scale-110 transition">
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                ) : c.icon ? (
                  <div className="flex h-full w-full items-center justify-center text-3xl md:text-4xl">
                    {c.icon}
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-sm font-bold text-plum text-center px-1 leading-tight">
                      {c.name}
                    </span>
                  </div>
                )}
              </div>

              <p className="font-display text-sm md:text-base text-plum text-center leading-tight">
                {c.name}
              </p>
              <p className="text-xs text-plum/60">
                {productCounts[c.id] != null ? productCounts[c.id] : "+"} productos
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
