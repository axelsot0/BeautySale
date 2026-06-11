import { createServiceClient } from "@/lib/supabase/service";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export type Section = {
  id: string;
  tenant_id: number;
  type: string;
  position: number;
  config: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
};

// Active sections for a tenant, ordered. Empty => storefront uses default layout.
export async function getSections(tenantId: number = DEFAULT_TENANT_ID): Promise<Section[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("position", { ascending: true });
  if (error) console.error("[getSections]", error.message);
  return (data ?? []) as Section[];
}
