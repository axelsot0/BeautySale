import { ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/data/types";
import {
  DEFAULT_HERO_EYEBROW,
  DEFAULT_HERO_EYEBROW_COLOR,
  DEFAULT_HERO_CTA2_LABEL,
  DEFAULT_HERO_CTA2_LINK,
  DEFAULT_HERO_MARQUEE,
} from "@/lib/theme";

export function Hero({ banner }: { banner: Banner }) {
  const eyebrow = banner.eyebrow_text?.trim() || DEFAULT_HERO_EYEBROW;
  const eyebrowColor = banner.eyebrow_color?.trim() || DEFAULT_HERO_EYEBROW_COLOR;
  const ctaLabel = banner.cta_label?.trim() || "Comprar ahora";
  const ctaLink = banner.link || "#categorias";
  const cta2Label = banner.cta2_label?.trim() || DEFAULT_HERO_CTA2_LABEL;
  const cta2Link = banner.cta2_link?.trim() || DEFAULT_HERO_CTA2_LINK;
  const marquee = banner.marquee_text?.trim() || DEFAULT_HERO_MARQUEE;

  return (
    <section className="relative overflow-hidden">
      {/* Blobs decorativos (toman la paleta del tenant) */}
      <div className="pointer-events-none absolute -top-28 -right-24 h-96 w-96 rounded-full bg-butter/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-lavender/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 rounded-full bg-pink/10 blur-3xl" />

      <div className={`relative max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-20 items-center ${banner.image_url ? "grid md:grid-cols-2 gap-10 md:gap-16" : "flex"}`}>
        <div className="space-y-6 md:space-y-8 z-10">
          <span
            className="animate-fade-up inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-plum -rotate-2 shadow-[0_4px_16px_rgba(45,27,78,0.12)]"
            style={{ backgroundColor: eyebrowColor }}
          >
            {eyebrow}
          </span>
          <h1
            className="animate-fade-up font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight"
            style={{ animationDelay: "0.08s" }}
          >
            {banner.title}
          </h1>
          {banner.subtitle && (
            <p
              className="animate-fade-up text-lg md:text-xl text-plum-soft max-w-md"
              style={{ animationDelay: "0.16s" }}
            >
              {banner.subtitle}
            </p>
          )}
          <div className="animate-fade-up flex flex-wrap items-center gap-4" style={{ animationDelay: "0.24s" }}>
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 rounded-full bg-pink px-7 py-4 font-semibold text-cream transition hover:shadow-[0_0_32px_rgba(255,77,139,0.5)] hover:-translate-y-0.5 active:scale-[0.97]"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={cta2Link}
              className="font-semibold text-plum underline-offset-4 hover:underline hover:text-pink transition"
            >
              {cta2Label}
            </a>
          </div>
        </div>

        {banner.image_url && (
          <div className="relative animate-fade-up" style={{ animationDelay: "0.12s" }}>
            <div className="relative aspect-square rounded-[40px] bg-pink overflow-hidden shadow-[0_24px_60px_rgba(255,77,139,0.3)] ring-1 ring-plum/5 transition-transform duration-500 hover:rotate-[0.5deg] hover:scale-[1.01]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.image_url} alt={banner.title} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-butter animate-float" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-mint animate-float" style={{ animationDelay: "1.5s" }} />
              <div className="absolute top-1/2 right-8 h-16 w-16 rounded-full bg-lavender animate-float" style={{ animationDelay: "0.8s" }} />
              <div className="absolute bottom-0 left-0 right-0 overflow-hidden bg-cream py-2">
                <div className="flex animate-marquee-hero font-display font-bold text-plum whitespace-nowrap">
                  {[0, 1].map((g) => (
                    <div key={g} className="flex shrink-0 gap-8 pr-8" aria-hidden={g === 1}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i}>{marquee}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
