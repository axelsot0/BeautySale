import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

// Reads tenants.demo_mode once per (request, tenant) via React cache.
// Defaults to true on any error so the storefront never ends up blank by accident.
export const getDemoMode = cache(async (tenantId: number = DEFAULT_TENANT_ID): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tenants")
      .select("demo_mode")
      .eq("id", tenantId)
      .single();
    return data?.demo_mode !== false;
  } catch {
    return true;
  }
});
