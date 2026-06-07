import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("position", { ascending: true });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">catálogo</p>
        <h1 className="font-display text-4xl mt-1">Nuevo producto</h1>
      </header>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
