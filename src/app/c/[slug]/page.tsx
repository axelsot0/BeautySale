import { notFound } from "next/navigation";
import { ChevronRight, PackageOpen } from "lucide-react";
import { getCategoryBySlug, getProductsByCategory, getCategories } from "@/lib/data/queries";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ProductCard } from "@/components/storefront/ProductCard";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [category, products, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
    getCategories(),
  ]);

  if (!category) notFound();

  const siblings = allCategories.filter((c) => c.slug !== slug);

  return (
    <>
      <Header />

      <main className="flex-1 w-full">

        {/* Hero banner de categoría */}
        <div
          className="relative py-14 md:py-20 overflow-hidden"
          style={{ backgroundColor: category.color }}
        >
          {/* Blobs decorativos */}
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-plum/10 blur-2xl" />

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-6">
            {/* Imagen o emoji */}
            <div className="h-20 w-20 md:h-28 md:w-28 shrink-0 rounded-full overflow-hidden bg-cream/80 shadow-[0_12px_32px_rgba(45,27,78,0.15)] flex items-center justify-center">
              {category.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
              ) : category.icon ? (
                <span className="text-4xl md:text-5xl">{category.icon}</span>
              ) : (
                <span className="font-display text-2xl text-plum font-bold px-2 text-center leading-tight">
                  {category.name}
                </span>
              )}
            </div>

            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-xs text-plum/60 mb-2">
                <a href="/" className="hover:text-plum transition">Inicio</a>
                <ChevronRight className="h-3 w-3" />
                <span className="text-plum font-semibold">{category.name}</span>
              </nav>
              <h1 className="font-display text-4xl md:text-6xl text-plum leading-none">
                {category.name}
              </h1>
              <p className="text-plum/70 mt-2 font-medium">
                {products.length} {products.length === 1 ? "producto" : "productos"}
              </p>
            </div>
          </div>
        </div>

        {/* Otras categorías — chips horizontales */}
        {siblings.length > 0 && (
          <div className="border-b border-plum/5 bg-cream">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar">
              <a
                href="/productos"
                className="shrink-0 rounded-full border border-plum/15 px-4 py-1.5 text-sm font-medium hover:bg-plum/5 transition"
              >
                Todas
              </a>
              {siblings.map((c) => (
                <a
                  key={c.id}
                  href={`/c/${c.slug}`}
                  className="shrink-0 rounded-full px-4 py-1.5 text-sm font-bold text-white transition hover:opacity-80"
                  style={{ backgroundColor: c.color }}
                >
                  {c.icon && <span className="mr-1">{c.icon}</span>}
                  {c.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Grid de productos */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-plum-soft">
              <PackageOpen className="h-16 w-16 opacity-20" />
              <p className="font-display text-2xl">Sin productos todavía</p>
              <p className="text-sm">Pronto habrá novedades en esta categoría.</p>
              <a
                href="/"
                className="mt-2 rounded-full bg-pink px-6 py-3 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
              >
                Ver todo el catálogo
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
