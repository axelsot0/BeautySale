"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";

async function ensureAdmin(): Promise<number> {
  const u = await getAdminUser();
  if (!u) throw new Error("unauthorized");
  return getAdminTenantId();
}

export type SettingsState = { ok?: boolean; error?: string };

// Save PayPal credentials. Empty client/secret => clears (falls back to env).
export async function savePayPal(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const tenantId = await ensureAdmin();

  const clientId = String(formData.get("paypal_client_id") ?? "").trim();
  const secretInput = String(formData.get("paypal_secret") ?? "").trim();
  const mode = String(formData.get("paypal_mode") ?? "sandbox") === "live" ? "live" : "sandbox";
  const clear = formData.get("clear") === "true";

  const supabase = createServiceClient();

  if (clear) {
    const { error } = await supabase
      .from("tenants")
      .update({ paypal_client_id: null, paypal_secret: null, paypal_mode: "sandbox" })
      .eq("id", tenantId);
    if (error) return { error: error.message };
    revalidatePath("/admin/settings");
    return { ok: true };
  }

  // Secret left blank => keep the stored one (never echoed back to the client).
  const { data: existing } = await supabase
    .from("tenants")
    .select("paypal_secret")
    .eq("id", tenantId)
    .single();
  const secret = secretInput || (existing?.paypal_secret as string | null) || "";

  if (!clientId || !secret) {
    return { error: "Ingresá Client ID y Secret." };
  }

  const { error } = await supabase
    .from("tenants")
    .update({ paypal_client_id: clientId, paypal_secret: secret, paypal_mode: mode })
    .eq("id", tenantId);
  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { ok: true };
}
