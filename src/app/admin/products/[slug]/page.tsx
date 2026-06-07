import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("tenant_id", tenantId).eq("slug", slug).single(),
    supabase.from("categories").select("*").eq("tenant_id", tenantId).order("position", { ascending: true }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">catálogo</p>
        <h1 className="font-display text-4xl mt-1">Editar producto</h1>
        <p className="text-plum-soft mt-1">{product.title}</p>
      </header>
      <ProductForm product={product} categories={categories ?? []} />
    </div>
  );
}
