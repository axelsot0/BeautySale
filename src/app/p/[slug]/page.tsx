import { notFound } from "next/navigation";
import { Star, ChevronRight } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/queries";
import { applyDiscount, formatPrice } from "@/lib/utils";
import { ProductGallery } from "./ProductGallery";
import { AddToCart } from "./AddToCart";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { Footer } from "@/components/storefront/Footer";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category_id, slug, 4);
  const finalPrice = applyDiscount(product.price, product.discount_percent);
  const hasDiscount = product.discount_percent > 0;

  // Fake-but-consistent rating from slug
  const ratingInt = (slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 9) + 1;
  const rating = `4.${ratingInt}`;
  const reviews = ((slug.length * 7) % 200) + 12;

  return (
    <>
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-plum-soft mb-6">
          <a href="/" className="hover:text-pink transition">Inicio</a>
          <ChevronRight className="h-3 w-3" />
          {product.category && (
            <>
              <a
                href={`/c/${product.category.slug}`}
                className="hover:text-pink transition"
              >
                {product.category.name}
              </a>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-plum font-medium line-clamp-1">{product.title}</span>
        </nav>

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* Gallery */}
          <ProductGallery images={product.images} title={product.title} slug={product.slug} />

          {/* Info */}
          <div className="space-y-5 md:sticky md:top-24">

            {/* Category + badges */}
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <a
                  href={`/c/${product.category.slug}`}
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ background: product.category.color }}
                >
                  {product.category.name}
                </a>
              )}
              {product.featured && (
                <span className="rounded-full bg-butter px-3 py-1 text-xs font-bold text-plum">
                  ⭐ TOP
                </span>
              )}
              {hasDiscount && (
                <span className="rounded-full bg-pink px-3 py-1 text-xs font-bold text-cream">
                  -{product.discount_percent}% OFF
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl leading-tight">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm text-plum-soft">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill={i < Math.floor(parseFloat(rating)) ? "#FFE066" : "none"}
                    stroke={i < Math.floor(parseFloat(rating)) ? "#FFE066" : "currentColor"}
                  />
                ))}
              </div>
              <span className="font-semibold text-plum">{rating}</span>
              <span>· {reviews} reseñas</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl">{formatPrice(finalPrice)}</span>
              {hasDiscount && (
                <span className="text-xl text-plum-soft line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-plum-soft leading-relaxed">{product.description}</p>
            )}

            {/* Add to cart */}
            <AddToCart
              productId={product.id}
              title={product.title}
              price={finalPrice}
              image={product.images?.[0] ?? null}
              stock={product.stock}
            />

            {/* Trust chips */}
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                "🚚 Envío gratis +$50",
                "🔒 Pago seguro",
                "↩️ Devolución 30 días",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-plum/5 px-3 py-1.5 text-xs font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl mb-6">También te puede gustar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
