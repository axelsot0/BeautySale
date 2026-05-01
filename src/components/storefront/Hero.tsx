import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="space-y-6 md:space-y-8 z-10">
          <span className="inline-block rounded-full bg-butter px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-plum -rotate-2">
            ✨ Nueva colección
          </span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
            Glow{" "}
            <span className="italic text-pink bg-gradient-to-r from-pink via-lavender to-pink bg-clip-text text-transparent">
              squad
            </span>
            <br />primavera 2026
          </h1>
          <p className="text-lg md:text-xl text-plum-soft max-w-md">
            Belleza que se siente. Más de 200 productos para tus rituales diarios. Hecho con cariño.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/colecciones/primavera"
              className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3.5 font-semibold text-cream transition hover:shadow-[0_0_32px_rgba(255,77,139,0.5)]"
            >
              Comprar ahora
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#categorias"
              className="font-semibold text-plum underline-offset-4 hover:underline hover:text-pink"
            >
              Ver categorías
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-square rounded-[40px] bg-pink overflow-hidden shadow-[0_24px_60px_rgba(255,77,139,0.3)]">
            <div className="absolute inset-0 grid place-items-center">
              <div className="font-display text-cream text-[200px] leading-none opacity-30 select-none">
                💄
              </div>
            </div>
            <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-butter animate-float" />
            <div
              className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-mint animate-float"
              style={{ animationDelay: "1.5s" }}
            />
            <div
              className="absolute top-1/2 right-8 h-16 w-16 rounded-full bg-lavender animate-float"
              style={{ animationDelay: "0.8s" }}
            />

            <span className="absolute top-6 right-6 inline-block rounded-full bg-butter px-4 py-2 text-sm font-bold text-plum -rotate-6 shadow-[0_8px_16px_rgba(45,27,78,0.15)]">
              -20% flash 🔥
            </span>

            <div className="absolute bottom-0 left-0 right-0 overflow-hidden bg-cream py-2">
              <div className="flex gap-6 animate-marquee-fast whitespace-nowrap font-display font-bold text-plum">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i}>NUEVO ★ NUEVO ★ NUEVO ★ NUEVO ★&nbsp;</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
