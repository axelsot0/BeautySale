import { createServiceClient } from "@/lib/supabase/service";
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { DEFAULT_SITE_NAME } from "@/lib/theme";
import { CheckoutClient } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = createServiceClient();
  const tenantId = await getStorefrontTenantId();

  const { data } = await supabase
    .from("tenants")
    .select("whatsapp_checkout, site_name")
    .eq("id", tenantId)
    .single();

  const waNumber = (data?.whatsapp_checkout as string | null)?.trim() ?? "";
  const siteName = (data?.site_name as string | null)?.trim() || DEFAULT_SITE_NAME;

  return <CheckoutClient waNumber={waNumber} siteName={siteName} />;
}
