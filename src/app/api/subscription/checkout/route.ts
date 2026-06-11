import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";
import { createPayPalOrder } from "@/lib/paypal";
import { getPlatformPayPalCreds } from "@/lib/platform-paypal";
import { PLAN_PRICES, PRO_DISCOUNT_PCT, PLAN_LABELS } from "@/lib/plans";

const schema = z.object({
  plan: z.enum(["basic", "pro"]),
  months: z.coerce.number().int().min(1).max(24),
  promo: z.string().max(40).optional(),
});

// Crea una orden PayPal (cuenta de la plataforma) para pagar/renovar el plan.
// El monto se calcula SIEMPRE server-side. El promo 30% aplica solo a Pro,
// solo si el código existe y no fue usado (descuenta 1 mes al 30%).
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const tenantId = await getAdminTenantId();

  const creds = getPlatformPayPalCreds();
  if (!creds) {
    return NextResponse.json({ error: "payments_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { plan, months } = parsed.data;
  const promoCode = (parsed.data.promo ?? "").trim().toUpperCase();
  const price = PLAN_PRICES[plan];
  const subtotal = price * months;

  // Validar promo (solo Pro)
  let discount = 0;
  let validPromo = "";
  if (promoCode && plan === "pro") {
    const supabase = createServiceClient();
    const { data: claim } = await supabase
      .from("pro_discount_claims")
      .select("id, used")
      .eq("code", promoCode)
      .maybeSingle();
    if (!claim) return NextResponse.json({ error: "promo_invalid" }, { status: 400 });
    if (claim.used) return NextResponse.json({ error: "promo_used" }, { status: 400 });
    discount = +(price * (PRO_DISCOUNT_PCT / 100)).toFixed(2); // 30% de 1 mes
    validPromo = promoCode;
  }

  const origin = req.nextUrl.origin;
  // custom_id viaja hasta el capture: tenant:plan:months:promo
  const customId = `${tenantId}:${plan}:${months}:${validPromo}`;

  try {
    const order = await createPayPalOrder({
      items: [
        {
          name: `Plan ${PLAN_LABELS[plan]} x ${months} ${months === 1 ? "mes" : "meses"}`,
          quantity: "1",
          unit_amount: { currency_code: "USD", value: subtotal.toFixed(2) },
        },
      ],
      subtotal,
      discount,
      returnUrl: `${origin}/api/subscription/capture`,
      cancelUrl: `${origin}/admin/subscription?cancelled=1`,
      customId,
      creds,
    });

    const approve = order.links.find((l) => l.rel === "approve")?.href;
    if (!approve) throw new Error("missing approve link");
    return NextResponse.json({ approveUrl: approve });
  } catch (e) {
    console.error("[subscription/checkout]", e);
    return NextResponse.json({ error: "paypal_error" }, { status: 502 });
  }
}
