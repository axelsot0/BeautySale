export const dynamic = "force-dynamic";

export default function StoreUnavailable() {
  return (
    <main className="min-h-screen grid place-items-center bg-cream px-4 text-center">
      <div className="space-y-3">
        <h1 className="font-display text-4xl text-plum">Tienda no disponible</h1>
        <p className="text-plum-soft">
          Esta tienda no existe o fue desactivada.
        </p>
        <a
          href="/"
          className="inline-block rounded-full bg-pink px-6 py-3 font-semibold text-cream hover:opacity-90 transition"
        >
          Ir al inicio
        </a>
      </div>
    </main>
  );
}
