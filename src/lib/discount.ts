import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export const NEWSLETTER_DISCOUNT_PERCENT = 10; // fallback when tenant has no config

export type DiscountCheck =
  | { valid: true; percent: number }
  | { valid: false; reason: "not_found" | "used" | "invalid" };

// Validates a discount code without consuming it.
export async function checkDiscountCode(
  raw: string,
  tenantId: number = DEFAULT_TENANT_ID,
): Promise<DiscountCheck> {
  const code = raw.trim().toUpperCase();
  if (!code) return { valid: false, reason: "invalid" };

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("id, used")
    .eq("tenant_id", tenantId)
    .eq("code", code)
    .maybeSingle();

  if (!data) return { valid: false, reason: "not_found" };
  if (data.used) return { valid: false, reason: "used" };

  const { data: tenant } = await supabase
    .from("tenants")
    .select("newsletter_discount_pct")
    .eq("id", tenantId)
    .single();
  const percent = (tenant?.newsletter_discount_pct as number | null) ?? NEWSLETTER_DISCOUNT_PERCENT;

  return { valid: true, percent };
}

// Marks a code consumed. Idempotent; ignores unknown codes.
export async function consumeDiscountCode(
  raw: string,
  tenantId: number = DEFAULT_TENANT_ID,
): Promise<void> {
  const code = raw.trim().toUpperCase();
  if (!code) return;
  const supabase = createServiceClient();
  await supabase
    .from("newsletter_subscribers")
    .update({ used: true })
    .eq("tenant_id", tenantId)
    .eq("code", code);
}
