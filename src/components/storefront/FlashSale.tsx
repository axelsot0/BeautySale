"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

function nextEnd() {
  // 24-hour rolling deadline.
  const t = new Date();
  t.setHours(t.getHours() + 24, 0, 0, 0);
  return t.getTime();
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function FlashSale() {
  const [endsAt] = useState(() => nextEnd());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, endsAt - now);
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  const blocks = [
    { label: "días", value: pad(days), bg: "bg-cream" },
    { label: "hs",   value: pad(hours), bg: "bg-cream" },
    { label: "min",  value: pad(minutes), bg: "bg-cream" },
    { label: "seg",  value: pad(seconds), bg: "bg-butter" },
  ];

  return (
    <section className="py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[32px] p-6 md:p-12 bg-gradient-to-br from-pink via-lavender to-butter">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-cream/30 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-mint/40 blur-2xl" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-cream">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-plum/20 backdrop-blur px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 fill-butter text-butter" />
                Flash sale 24hs
              </span>
              <h2 className="font-display text-5xl md:text-7xl leading-none drop-shadow-[0_2px_8px_rgba(45,27,78,0.2)]">
                -40% OFF
              </h2>
              <p className="text-cream/90 text-lg max-w-md">
                En selección de cuidado facial y labiales. Sin código, descuento aplicado al carrito.
              </p>
              <a
                href="/ofertas"
                className="inline-block rounded-full bg-cream px-6 py-3 font-bold text-plum hover:bg-butter transition"
              >
                Comprar ofertas
              </a>
            </div>

            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {blocks.map((b) => (
                <div
                  key={b.label}
                  className={`${b.bg} rounded-2xl p-3 md:p-4 text-center shadow-[6px_6px_0_rgba(45,27,78,0.9)]`}
                >
                  <div className="font-display text-3xl md:text-5xl text-plum tabular-nums">
                    {b.value}
                  </div>
                  <div className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-plum/70">
                    {b.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
