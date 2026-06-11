import "server-only";
import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/service";
import { NON_DEMO_STATUS, type TenantStatus } from "@/lib/demo";

const DAY_MS = 24 * 60 * 60 * 1000;

// Resolves demo/plan status for a tenant. Cached per request.
export const getTenantStatus = cache(async (tenantId: number): Promise<TenantStatus> => {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("tenants")
    .select("is_demo, demo_expires_at, plan, plan_expires_at")
    .eq("id", tenantId)
    .maybeSingle();

  const isDemo = data?.is_demo === true;
  const plan = (data?.plan as TenantStatus["plan"] | null) ?? (isDemo ? "demo" : "basic");
  const planExpiresAt = (data?.plan_expires_at as string | null) ?? null;

  if (!isDemo) return { ...NON_DEMO_STATUS, plan, planExpiresAt };

  const demoExpiresAt = (data?.demo_expires_at as string | null) ?? null;
  let daysLeft: number | null = null;
  let expired = false;
  if (demoExpiresAt) {
    const ms = new Date(demoExpiresAt).getTime() - Date.now();
    daysLeft = Math.max(0, Math.ceil(ms / DAY_MS));
    expired = ms < 0;
  }
  return { isDemo, plan: "demo", planExpiresAt, demoExpiresAt, daysLeft, expired };
});

// Throws if the tenant is a demo store. Use to guard premium-only server
// actions (payments, theme, etc.) against hand-crafted requests that bypass UI.
export async function assertNotDemo(tenantId: number): Promise<void> {
  const { isDemo } = await getTenantStatus(tenantId);
  if (isDemo) throw new Error("Función no disponible en modo demo. Activá tu tienda.");
}
