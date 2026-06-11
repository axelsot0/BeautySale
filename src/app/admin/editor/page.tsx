import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId, getAdminMembership } from "@/lib/tenant-context";
import { getNewsletterConfig } from "@/lib/data/theme-query";
import { getTenantStatus } from "@/lib/demo-server";
import { EditorClient } from "./EditorClient";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();

  const [{ data: sections }, { data: categories }, newsletterConfig, { data: tenant }, membership, status] = await Promise.all([
    supabase.from("sections").select("*").eq("tenant_id", tenantId).order("position", { ascending: true }),
    supabase.from("categories").select("slug, name").eq("tenant_id", tenantId).order("position", { ascending: true }),
    getNewsletterConfig(tenantId),
    supabase.from("tenants").select("slug").eq("id", tenantId).maybeSingle(),
    getAdminMembership(),
    getTenantStatus(tenantId),
  ]);

  const isPro = membership?.role === "developer" || status.plan === "pro";

  // /t/<slug> fija la cookie de tienda y redirige al storefront correcto.
  const previewPath = tenant?.slug ? `/t/${tenant.slug}` : "/store";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">diseño</p>
        <h1 className="font-display text-4xl mt-1">Editor visual</h1>
        <p className="text-plum-soft mt-1">
          Editá a la izquierda y mirá el resultado en vivo a la derecha. Arrastrá las secciones
          para reordenarlas.
        </p>
      </header>

      <EditorClient
        sections={(sections ?? []).map((s) => ({
          id: s.id,
          type: s.type,
          active: s.active,
          config: (s.config ?? {}) as Record<string, string | undefined>,
        }))}
        categories={categories ?? []}
        newsletterConfig={newsletterConfig}
        previewPath={previewPath}
        isPro={isPro}
      />
    </div>
  );
}
