"use client";

import { Heart, Star } from "lucide-react";
import { applyDiscount, cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/data/types";

const PALETTE = ["#FFB3CC", "#E5DEFF", "#FFF3B0", "#CFEFE6", "#FFE5F0", "#D7E9FF"];

function colorFromSlug(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function ProductCard({ product }: { product: Product }) {
  const finalPrice = applyDiscount(product.price, product.discount_percent);
  const hasDiscount = product.discount_percent > 0;
  const bg = colorFromSlug(product.slug);
  const productImage = product.images?.[0];

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-3 rounded-[24px] bg-white/70 p-3",
        "transition-all duration-300 hover:-translate-y-1 hover:rotate-[-0.5deg]",
        "shadow-[0_4px_16px_rgba(45,27,78,0.06)] hover:shadow-[0_16px_40px_rgba(255,77,139,0.18)]",
      )}
    >
      <div
        className="relative aspect-square w-full overflow-hidden rounded-[18px]"
        style={{ backgroundColor: bg }}
      >
        {productImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={productImage}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-6xl text-plum/20">
              {product.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.featured && (
            <span className="inline-block rounded-full bg-butter px-2.5 py-1 text-[10px] font-bold text-plum -rotate-3">
              ⭐ TOP
            </span>
          )}
          {hasDiscount && (
            <span className="inline-block rounded-full bg-pink px-2.5 py-1 text-[10px] font-bold text-cream rotate-2">
              -{product.discount_percent}%
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label="Agregar a favoritos"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-plum backdrop-blur transition hover:bg-pink hover:text-cream"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="px-1 flex flex-col gap-1">
        <div className="flex items-center gap-1 text-xs text-plum-soft">
          <Star className="h-3.5 w-3.5 fill-butter text-butter" />
          <span className="font-semibold text-plum">4.{(product.title.length % 9) + 1}</span>
          <span>· {(product.title.length * 7) % 200 + 12} reseñas</span>
        </div>
        <h3 className="font-display text-lg leading-tight line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl">{formatPrice(finalPrice)}</span>
          {hasDiscount && (
            <span className="text-sm text-plum-soft line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="mt-1 rounded-full bg-plum px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-pink hover:shadow-[0_0_24px_rgba(255,77,139,0.4)]"
      >
        Agregar
      </button>
    </article>
  );
}
