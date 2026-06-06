import { getCategories } from "@/lib/data/queries";
import { getDemoMode } from "@/lib/data/demo";
import { createServiceClient } from "@/lib/supabase/service";
import { mockProducts } from "@/lib/data/mock";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { Footer } from "@/components/storefront/Footer";
import { ProductSearch } from "./ProductSearch";

// ISR: recache every 60s — search/filter are client-side so data can be slightly stale
export const revalidate = 60;

async function getAllProducts() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return (await getDemoMode()) ? mockProducts : [];
  return data;
}

export default async function ProductosPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        <header className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-pink">catálogo</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1">Todos los productos</h1>
        </header>

        <ProductSearch products={products} categories={categories} />
      </main>

      <Footer />
    </>
  );
}
