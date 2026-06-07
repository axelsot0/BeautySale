import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export type PayPalConfig = {
  clientId: string;
  secret: string;
  mode: "sandbox" | "live";
};

// Reads PayPal credentials from platform_settings (admin-managed).
// Falls back to env vars when the row is missing/empty.
export async function getPayPalConfig(): Promise<PayPalConfig> {
  const envCfg: PayPalConfig = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
    secret: process.env.PAYPAL_CLIENT_SECRET ?? "",
    mode: process.env.PAYPAL_MODE === "live" ? "live" : "sandbox",
  };

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("paypal_client_id, paypal_secret, paypal_mode")
      .eq("id", 1)
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
