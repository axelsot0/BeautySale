import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { capturePayPalOrder } from "@/lib/paypal";
import { getPlatformPayPalCreds } from "@/lib/platform-paypal";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// Retorno de PayPal tras aprobar el pago de suscripción.
// Captura, extiende el plan del tenant y registra el pago.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token"); // PayPal order id
  const origin = req.nextUrl.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/admin/subscription?error=${reason}`);

  if (!token) return fail("missing_token");
  const creds = getPlatformPayPalCreds();
  if (!creds) return fail("not_configured");

  try {
    const capture = await capturePayPalOrder(token, creds);
    if (capture.status !== "COMPLETED") return fail("not_completed");

    const cap = capture.purchase_units?.[0]?.payments?.captures?.[0];
    const customId = cap?.custom_id ?? "";
    const [tenantStr, plan, monthsStr, promo] = customId.split(":");
    const tenantId = Number(tenantStr);
    const months = Number(monthsStr);
    if (!tenantId || (plan !== "basic" && plan !== "pro") || !months) {
      console.error("[subscription/capture] bad custom_id:", customId);
      return fail("bad_order");
    }

    const amount = Number(cap?.amount?.value ?? 0);
    const supabase = createServiceClient();

    // Extiende desde el vencimiento actual si sigue vigente; si no, desde hoy.
    const { data: tenant } = await supabase
      .from("tenants")
      .select("plan_expires_at")
      .eq("id", tenantId)
      .maybeSingle();
    const currentExpiry = tenant?.plan_expires_at ? new Date(tenant.plan_expires_at).getTime() : 0;
    const base = Math.max(Date.now(), currentExpiry);
    const newExpiry = new Date(base + months * MONTH_MS).toISOString();

    await supabase
      .from("tenants")
      .update({
        plan,
        plan_expires_at: newExpiry,
        is_demo: false,
        demo_expires_at: null,
        active: true,
      })
      .eq("id", tenantId);
    await supabase.from("admins").update({ active: true }).eq("tenant_id", tenantId).neq("role", "developer");

    await supabase.from("subscription_payments").insert({
      tenant_id: tenantId,
      plan,
      months,
      amount,
      method: "paypal",
      note: `PayPal ${cap?.id ?? token}${promo ? ` · promo ${promo}` : ""}`,
    });

    if (promo) {
      await supabase.from("pro_discount_claims").update({ used: true }).eq("code", promo);
    }

    return NextResponse.redirect(`${origin}/admin/subscription?paid=1`);
  } catch (e) {
    console.error("[subscription/capture]", e);
    return fail("capture_failed");
  }
}
