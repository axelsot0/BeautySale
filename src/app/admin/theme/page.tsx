import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId, getAdminMembership } from "@/lib/tenant-context";
import { DEFAULT_PALETTE, parsePalette } from "@/lib/theme";
import { ThemeEditor } from "./ThemeEditor";

export const dynamic = "force-dynamic";

export default async function AdminThemePage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();
  const { data } = await supabase
    .from("tenants")
    .select("theme, logo_url, demo_mode")
    .eq("id", tenantId)
    .single();

  const current = parsePalette(data?.theme) ?? DEFAULT_PALETTE;
  const isDefault = parsePalette(data?.theme) === null;
  const logoUrl = (data?.logo_url as string | null) ?? null;
  const demoMode = data?.demo_mode !== false;
  const membership = await getAdminMembership();
  const isDeveloper = membership?.role === "developer";

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">apariencia</p>
        <h1 className="font-display text-4xl mt-1">Tema y marca</h1>
        <p className="text-plum-soft mt-1">
          Personaliza la paleta de colores y el logo. Los cambios son visibles para todos los
          clientes. Si algo falla, se usa la paleta por defecto.
        </p>
      </header>

      <ThemeEditor
        current={current}
        isDefault={isDefault}
        logoUrl={logoUrl}
        demoMode={demoMode}
        isDeveloper={isDeveloper}
      />
    </div>
  );
}
