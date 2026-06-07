import { Zap, PackageOpen } from "lucide-react";
import { getOnSaleProducts, getCategories } from "@/lib/data/queries";
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { Footer } from "@/components/storefront/Footer";
import { ProductSearch } from "../productos/ProductSearch";

export const dynamic = "force-dynamic";

export default async function OfertasPage() {
  const t = await getStorefrontTenantId();
  const [products, categories] = await Promise.all([
    getOnSaleProducts(48, t),
    getCategories(t),
  ]);

  // Promedio descuento (sólo si hay items)
  const avgDiscount = products.length
    ? Math.round(
        products.reduce((s, p) => s + p.discount_percent, 0) / products.length,
      )
    : 0;
  const maxDiscount = products.reduce((m, p) => Math.max(m, p.discount_percent), 0);

  return (
    <>
      <SiteHeader />

      <main className="flex-1 w-full">

        {/* Hero banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-pink via-lavender to-butter py-14 md:py-20">
          {/* Blobs */}
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-cream/30 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-mint/40 blur-2xl" />

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-cream">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-plum/30 backdrop-blur px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
              <Zap className="h-3.5 w-3.5 fill-butter text-butter" />
              Ofertas activas
            </span>
            <h1 className="font-display text-5xl md:text-7xl leading-none drop-shadow-[0_2px_8px_rgba(45,27,78,0.2)]">
              Glow time 🔥
            </h1>
            <p className="text-lg md:text-xl text-cream/90 mt-3 max-w-xl">
              {products.length > 0
                ? `${products.length} productos con descuentos hasta -${maxDiscount}%`
                : "Pronto vamos a tener ofertas activas"}
            </p>

            {products.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6">
                <Stat label="Productos" value={products.length} />
                <Stat label="Desc. promedio" value={`${avgDiscount}%`} />
                <Stat label="Hasta" value={`-${maxDiscount}%`} accent />
              </div>
            )}
          </div>
        </section>

        {/* Products */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          {products.length > 0 ? (
            <ProductSearch products={products} categories={categories} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-plum-soft">
              <PackageOpen className="h-16 w-16 opacity-20" />
              <p className="font-display text-2xl">Sin ofertas todavía</p>
              <p className="text-sm">Volvé pronto, vienen descuentos imperdibles.</p>
              <a
                href="/productos"
                className="mt-2 rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
              >
                Ver catálogo completo
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function Stat({
  label, value, accent,
}: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl px-4 py-2 backdrop-blur ${
        accent ? "bg-butter text-plum" : "bg-cream/20 text-cream"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}
