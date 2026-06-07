import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export type Section = Database["public"]["Tables"]["sections"]["Row"];

// Active sections for a tenant, ordered. Empty => storefront uses default layout.
export async function getSections(tenantId: number = DEFAULT_TENANT_ID): Promise<Section[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sections")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("position", { ascending: true });
  return data ?? [];
}
