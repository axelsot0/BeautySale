import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

// Tenant the currently logged-in admin belongs to (their membership row).
// Falls back to the primary tenant during the single-store transition.
export async function getAdminTenantId(): Promise<number> {
  const user = await getAdminUser();
  if (!user?.email) return DEFAULT_TENANT_ID;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("admins")
    .select("tenant_id")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  return data?.tenant_id ?? DEFAULT_TENANT_ID;
}
