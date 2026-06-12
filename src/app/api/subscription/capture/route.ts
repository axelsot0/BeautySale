import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { capturePayPalOrder } from "@/lib/paypal";
import { getPlatformPayPalCreds } from "@/lib/platform-paypal";
import { PLAN_PRICES, PRO_DISCOUNT_PCT } from "@/lib/plans";
import { validatePayPalCapture } from "@/lib/paypal-capture";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// PayPal return URL after a subscription payment approval.
// Captures the order, extends the tenant plan and stores an idempotent payment record.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token"); // PayPal order id
  const origin = req.nextUrl.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/admin/subscription?error=${reason}`);

  if (!token) return fail("missing_token");
  const creds = getPlatformPayPalCreds();
  if (!creds) return fail("not_configured");

  const supabase = createServiceClient();
  const { data: existingPayment } = await supabase
    .from("subscription_payments")
    .select("id")
    .eq("paypal_order_id", token)
    .maybeSingle();
  if (existingPayment) {
    return NextResponse.redirect(`${origin}/admin/subscription?paid=1`);
  }

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

    const baseAmount = PLAN_PRICES[plan] * months;
    const discount = promo && plan === "pro" ? PLAN_PRICES.pro * (PRO_DISCOUNT_PCT / 100) : 0;
    const expectedAmount = +(baseAmount - discount).toFixed(2);
    const validated = validatePayPalCapture(cap, expectedAmount);
    if (!validated.ok) {
      console.error("[subscription/capture] validation failed:", validated.error);
      return fail("amount_mismatch");
    }

    const { data: existingCapture } = await supabase
      .from("subscription_payments")
      .select("id")
      .eq("paypal_capture_id", validated.captureId)
      .maybeSingle();
    if (existingCapture) {
      return NextResponse.redirect(`${origin}/admin/subscription?paid=1`);
    }

    // Extend from the current expiry if still active; otherwise from today.
    const { data: tenant } = await supabase
      .from("tenants")
      .select("plan_expires_at")
      .eq("id", tenantId)
      .maybeSingle();
    const currentExpiry = tenant?.plan_expires_at ? new Date(tenant.plan_expires_at).getTime() : 0;
    const base = Math.max(Date.now(), currentExpiry);
    const newExpiry = new Date(base + months * MONTH_MS).toISOString();

    const { error: tenantErr } = await supabase
      .from("tenants")
      .update({
        plan,
        plan_expires_at: newExpiry,
        is_demo: false,
        demo_expires_at: null,
        active: true,
      })
      .eq("id", tenantId);
    if (tenantErr) throw tenantErr;

    const { error: adminsErr } = await supabase
      .from("admins")
      .update({ active: true })
      .eq("tenant_id", tenantId)
      .neq("role", "developer");
    if (adminsErr) throw adminsErr;

    const note = `PayPal ${validated.captureId}${promo ? ` - promo ${promo}` : ""}`;
    const { error: paymentErr } = await supabase.from("subscription_payments").insert({
      tenant_id: tenantId,
      plan,
      months,
      amount: validated.amount,
      currency: validated.currency,
      method: "paypal",
      paypal_order_id: token,
      paypal_capture_id: validated.captureId,
      note,
    });
    if (paymentErr) {
      if (paymentErr.code === "23505") {
        return NextResponse.redirect(`${origin}/admin/subscription?paid=1`);
      }
      throw paymentErr;
    }

    if (promo) {
      const { error: promoErr } = await supabase
        .from("pro_discount_claims")
        .update({ used: true })
        .eq("code", promo);
      if (promoErr) throw promoErr;
    }

    return NextResponse.redirect(`${origin}/admin/subscription?paid=1`);
  } catch (e) {
    console.error("[subscription/capture]", e);
    return fail("capture_failed");
  }
}
