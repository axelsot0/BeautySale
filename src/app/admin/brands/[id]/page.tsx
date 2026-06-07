import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { BrandForm } from "../BrandForm";

export const dynamic = "force-dynamic";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();
  const { data } = await supabase
    .from("brands")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">marcas</p>
        <h1 className="font-display text-4xl mt-1">Editar marca</h1>
      </header>
      <BrandForm brand={data} />
    </div>
  );
}
