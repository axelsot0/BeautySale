const BRANDS = [
  { name: "Lumière",   className: "font-serif italic font-light" },
  { name: "GLOSSY",    className: "font-display font-extrabold tracking-tight" },
  { name: "petal & co",className: "font-sans font-light tracking-[0.3em] uppercase" },
  { name: "Aurora",    className: "font-display font-medium italic" },
  { name: "BLOOM",     className: "font-sans font-black tracking-widest" },
  { name: "Sunkissed", className: "font-display font-semibold" },
  { name: "MIRA",      className: "font-sans font-thin tracking-[0.5em]" },
  { name: "Rosé Lab",  className: "font-display italic font-bold" },
];

export function BrandStrip() {
  const loop = [...BRANDS, ...BRANDS];
  return (
    <section className="py-8 md:py-10 border-y border-plum/10 group">
      <div className="overflow-hidden">
        <div className="flex items-center gap-12 md:gap-16 animate-marquee whitespace-nowrap text-2xl md:text-3xl text-plum-soft group-hover:text-plum transition-colors">
          {loop.map((b, i) => (
            <span key={`${b.name}-${i}`} className={b.className}>
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
