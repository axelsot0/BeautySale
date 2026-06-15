import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminMembership, getAdminTenantId } from "@/lib/tenant-context";
import { PLAN_PRICES, PRO_DISCOUNT_PCT, PLAN_LABELS } from "@/lib/plans";
import { platformWhatsAppUrl } from "@/lib/platform";

const schema = z.object({
  plan: z.enum(["basic", "pro"]),
  months: z.coerce.number().int().min(1).max(24),
  email: z.string().email(),
  store_name: z.string().min(1).max(100),
  promo: z.string().max(40).optional(),
});

// Solicitud de suscripción por transferencia (WhatsApp).
// Guarda una solicitud pendiente y devuelve el link de WhatsApp al dueño
// con todos los datos del checkout. El dev aprueba/activa desde /dev.
export async function POST(req: NextRequest) {
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

  const { plan, months, email, store_name } = parsed.data;
  const promoCode = (parsed.data.promo ?? "").trim().toUpperCase();
  const supabase = createServiceClient();

  // Tenant solo si hay sesión de admin. Visitantes sin cuenta => null.
  const membership = await getAdminMembership();
  const tenantId = membership ? await getAdminTenantId() : null;

  // Monto server-side (mismo cálculo que el checkout PayPal).
  const price = PLAN_PRICES[plan];
  let discount = 0;
  let validPromo = "";
  if (promoCode && plan === "pro") {
    const { data: claim } = await supabase
      .from("pro_discount_claims")
      .select("id, used")
      .eq("code", promoCode)
      .maybeSingle();
    if (claim && !claim.used) {
      discount = +(price * (PRO_DISCOUNT_PCT / 100)).toFixed(2);
      validPromo = promoCode;
    }
  }
  const amount = +(price * months - discount).toFixed(2);

  const { data: request, error } = await supabase
    .from("subscription_requests")
    .insert({
      tenant_id: tenantId,
      plan,
      months,
      amount,
      currency: "USD",
      email: email.toLowerCase(),
      store_name,
      method: "whatsapp",
      status: "pending",
      note: validPromo ? `promo ${validPromo}` : null,
    })
    .select("id")
    .single();

  if (error || !request) {
    console.error("[subscription/request]", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const lines = [
    "*Solicitud de suscripcion - BeautySale*",
    "",
    `Plan: ${PLAN_LABELS[plan]}`,
    `Periodo: ${months} ${months === 1 ? "mes" : "meses"}`,
    validPromo ? `Promo: ${validPromo} (-${PRO_DISCOUNT_PCT}%)` : "",
    `Total: USD $${amount.toFixed(2)}`,
    "",
    "*Datos del solicitante*",
    `Tienda: ${store_name}`,
    `Email: ${email}`,
    tenantId ? `Tenant ID: ${tenantId}` : "Nuevo (sin cuenta aun)",
    "",
    "Quiero pagar por transferencia. Espero los datos. Gracias.",
    `Ref: ${request.id.slice(0, 8).toUpperCase()}`,
  ].filter(Boolean);

  return NextResponse.json({
    requestId: request.id,
    waUrl: platformWhatsAppUrl(lines.join("\n")),
  });
}
