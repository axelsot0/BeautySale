"use client";

import { useState } from "react";

const PALETTE = ["#FFB3CC", "#E5DEFF", "#FFF3B0", "#CFEFE6", "#FFE5F0", "#D7E9FF"];
function colorFromSlug(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function ProductGallery({
  images,
  title,
  slug,
}: {
  images: string[];
  title: string;
  slug: string;
}) {
  const [active, setActive] = useState(0);
  const bg = colorFromSlug(slug);
  const hasImages = images.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative aspect-square w-full rounded-[28px] overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[active]}
            alt={title}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-9xl text-plum/20">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 h-16 w-16 rounded-2xl overflow-hidden border-2 transition ${
                active === i ? "border-pink" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
