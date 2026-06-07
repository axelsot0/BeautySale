import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { SectionBuilder } from "./SectionBuilder";

export const dynamic = "force-dynamic";

export default async function AdminSectionsPage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();

  const [{ data: sections }, { data: categories }] = await Promise.all([
    supabase.from("sections").select("*").eq("tenant_id", tenantId).order("position", { ascending: true }),
    supabase.from("categories").select("slug, name").eq("tenant_id", tenantId).order("position", { ascending: true }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">diseño</p>
        <h1 className="font-display text-4xl mt-1">Secciones de la portada</h1>
        <p className="text-plum-soft mt-1">
          El Hero va arriba y el footer abajo (fijos). En el medio apilá y reordená las secciones que
          quieras. Si no hay ninguna, se usa el diseño por defecto.
        </p>
      </header>

      <SectionBuilder
        sections={(sections ?? []).map((s) => ({
          id: s.id,
          type: s.type,
          active: s.active,
          config: (s.config ?? {}) as Record<string, string | undefined>,
        }))}
        categories={categories ?? []}
      />
    </div>
  );
}
