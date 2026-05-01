export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-16">
      <div className="max-w-5xl mx-auto space-y-12">
        <div>
          <p className="text-sm uppercase tracking-widest text-pink font-semibold">
            theme preview
          </p>
          <h1 className="font-display text-6xl md:text-8xl mt-2">
            Beauty<span className="italic text-pink">Sale</span>
          </h1>
          <p className="text-lg text-plum-soft mt-4 max-w-xl">
            Bold &amp; Colorful. Display: Bricolage Grotesque. Body: DM Sans.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            ["pink", "#FF4D8B"],
            ["lavender", "#B5A3E8"],
            ["butter", "#FFE066"],
            ["mint", "#7DD3C0"],
            ["cream", "#FFF8F0"],
            ["plum", "#2D1B4E"],
          ].map(([name, hex]) => (
            <div key={name} className="space-y-2">
              <div
                className="w-full aspect-square rounded-[24px] shadow-soft"
                style={{ backgroundColor: hex }}
              />
              <div>
                <p className="font-display text-lg capitalize">{name}</p>
                <p className="text-xs text-plum-soft uppercase">{hex}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button className="rounded-full bg-pink text-cream px-6 py-3 font-semibold hover:shadow-glow-pink transition">
            CTA primario
          </button>
          <button className="rounded-full bg-plum text-cream px-6 py-3 font-semibold hover:bg-pink transition">
            CTA secundario
          </button>
          <span className="rounded-full bg-butter text-plum px-4 py-2 text-sm font-bold -rotate-2 inline-block">
            -40% OFF
          </span>
          <span className="rounded-full bg-mint text-plum px-4 py-2 text-sm font-bold rotate-2 inline-block">
            NUEVO
          </span>
        </div>

        <div className="overflow-hidden bg-plum text-cream py-3 rounded-[24px]">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {Array.from({ length: 2 }).flatMap((_, i) =>
              ["✨ Envío gratis +$50", "💖 10% off primera compra", "💸 Hasta 12 cuotas", "🎁 Regalo en compras +$100"].map(
                (msg, j) => (
                  <span key={`${i}-${j}`} className="font-semibold tracking-wide">
                    {msg} <span className="text-pink mx-2">●</span>
                  </span>
                )
              )
            )}
          </div>
        </div>

        <p className="text-sm text-plum-soft border-t border-plum/10 pt-6">
          Próximo: Supabase clients + middleware platform-active.
        </p>
      </div>
    </main>
  );
}
