import { getCategories } from "@/lib/data/queries";
import { getDemoMode } from "@/lib/data/demo";
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { createServiceClient } from "@/lib/supabase/service";
import { mockProducts } from "@/lib/data/mock";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { Footer } from "@/components/storefront/Footer";
import { ProductSearch } from "./ProductSearch";

export const dynamic = "force-dynamic";

export { storeMetadata as generateMetadata } from "@/lib/store-metadata";

async function getAllProducts(tenantId: number) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return (await getDemoMode(tenantId)) ? mockProducts : [];
  return data;
}

export default async function ProductosPage() {
  const t = await getStorefrontTenantId();
  const [products, categories] = await Promise.all([
    getAllProducts(t),
    getCategories(t),
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
