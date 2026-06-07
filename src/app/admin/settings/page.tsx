import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { parseSocialLinks } from "@/lib/social";
import { DEFAULT_SITE_NAME } from "@/lib/theme";
import { PayPalForm } from "./PayPalForm";
import { SiteSettingsForm } from "./SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();
  const { data } = await supabase
    .from("tenants")
    .select("paypal_client_id, paypal_secret, paypal_mode, site_name, social_links")
    .eq("id", tenantId)
    .single();

  const siteName = (data?.site_name as string | null)?.trim() || DEFAULT_SITE_NAME;
  const social = parseSocialLinks(data?.social_links);

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">ajustes</p>
        <h1 className="font-display text-4xl mt-1">Ajustes de tienda</h1>
        <p className="text-plum-soft mt-1">
          Nombre, redes (footer) y cobros. El footer muestra estas redes y el copyright con el nombre.
        </p>
      </header>

      <SiteSettingsForm siteName={siteName} social={social} />

      <section className="space-y-2">
        <h2 className="font-display text-2xl">Pagos</h2>
        <p className="text-plum-soft text-sm">
          Conectá tu PayPal Business. Vacío = credenciales por defecto del sistema.
        </p>
        <PayPalForm
          clientId={(data?.paypal_client_id as string | null) ?? ""}
          mode={(data?.paypal_mode as string | null) === "live" ? "live" : "sandbox"}
          hasSecret={Boolean(data?.paypal_secret)}
        />
      </section>
    </div>
  );
}
