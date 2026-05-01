export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <a href="/" className="font-display text-2xl block">
          Beauty<span className="text-pink italic">Sale</span>
        </a>

        <div className="rounded-[24px] bg-white border border-plum/5 p-10 space-y-5">
          <div className="h-16 w-16 rounded-full bg-butter/40 flex items-center justify-center mx-auto">
            <span className="font-display text-4xl">😕</span>
          </div>
          <div>
            <h1 className="font-display text-2xl">Pago cancelado</h1>
            <p className="text-plum-soft mt-2 text-sm">
              No se realizó ningún cobro. Tu carrito sigue guardado.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <a
              href="/"
              className="rounded-full border border-plum/15 px-5 py-2.5 text-sm font-semibold hover:bg-plum/5 transition"
            >
              Seguir comprando
            </a>
            <a
              href="/checkout"
              className="rounded-full bg-pink px-5 py-2.5 text-sm font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
            >
              Volver al checkout
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
