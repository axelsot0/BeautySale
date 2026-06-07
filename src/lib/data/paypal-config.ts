import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export type PayPalConfig = {
  clientId: string;
  secret: string;
  mode: "sandbox" | "live";
};

// Reads PayPal credentials from the tenant row (admin-managed).
// Falls back to env vars when the row is missing/empty.
export async function getPayPalConfig(
  tenantId: number = DEFAULT_TENANT_ID,
): Promise<PayPalConfig> {
  const envCfg: PayPalConfig = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
    secret: process.env.PAYPAL_CLIENT_SECRET ?? "",
    mode: process.env.PAYPAL_MODE === "live" ? "live" : "sandbox",
  };

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("paypal_client_id, paypal_secret, paypal_mode")
      .eq("id", tenantId)
      .single();
    if (error || !data) return envCfg;

    const clientId = (data.paypal_client_id as string | null)?.trim();
    const secret = (data.paypal_secret as string | null)?.trim();
    if (!clientId || !secret) return envCfg;

    return {
      clientId,
      secret,
      mode: data.paypal_mode === "live" ? "live" : "sandbox",
    };
  } catch {
    return envCfg;
  }
}
