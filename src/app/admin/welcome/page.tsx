import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { WelcomeWizard } from "./WelcomeWizard";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const tenantId = await getAdminTenantId();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("tenants")
    .select("site_name, name")
    .eq("id", tenantId)
    .maybeSingle();

  return (
    <div className="max-w-xl mx-auto">
      <div className="rounded-[28px] bg-white border border-plum/10 p-7 md:p-10">
        <WelcomeWizard initialName={data?.site_name ?? data?.name ?? ""} />
      </div>
    </div>
  );
}
