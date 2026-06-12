import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { capturePayPalOrder } from "@/lib/paypal";
import { sendOrderConfirmation } from "@/lib/email";
import { consumeDiscountCode } from "@/lib/discount";
import { validatePayPalCapture } from "@/lib/paypal-capture";

const bodySchema = z.object({
  paypalOrderId: z.string().min(1),
  orderId: z.string().uuid(),
});

// ── POST /api/checkout/capture ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing paypalOrderId or orderId" }, { status: 422 });
  }

  const { paypalOrderId, orderId } = parsed.data;

  const supabase = createServiceClient();

  // Fetch full order (need all fields for email + idempotency check)
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({
      success: true,
      orderId,
      status: "paid",
      captureId: order.paypal_capture_id ?? null,
    });
  }

  if (order.status !== "pending") {
    return NextResponse.json(
      { error: `Orden en estado inválido: ${order.status}` },
      { status: 409 },
    );
  }

  if (order.paypal_order_id !== paypalOrderId) {
    return NextResponse.json({ error: "paypalOrderId mismatch" }, { status: 403 });
  }

  // Capture via PayPal
  try {
    const capture = await capturePayPalOrder(paypalOrderId);

    if (capture.status !== "COMPLETED") {
      await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
      return NextResponse.json(
        { error: `PayPal capture status: ${capture.status}` },
        { status: 402 },
      );
    }

    const cap = capture.purchase_units?.[0]?.payments?.captures?.[0];
    const expectedTotal = Number(order.total);
    const validated = validatePayPalCapture(cap, expectedTotal);
    if (!validated.ok) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
      return NextResponse.json(
        { error: `PayPal capture validation failed: ${validated.error}` },
        { status: 409 },
      );
    }

    // Mark paid
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paypal_capture_id: validated.captureId,
        paypal_capture_amount: validated.amount,
        paypal_capture_currency: validated.currency,
      })
      .eq("id", orderId)
      .eq("status", "pending");
    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 409 });
    }

    // Consume discount code (one-time use)
    if (order.discount_code) {
      await consumeDiscountCode(order.discount_code, order.tenant_id ?? undefined).catch((err) =>
        console.error("[discount] consume failed:", err),
      );
    }

    // Send confirmation email (non-blocking — don't fail the response if email errors)
    const items = Array.isArray(order.items) ? order.items as {
      id: string; title: string; price: number; quantity: number; image?: string | null;
    }[] : [];

    const shipping = order.shipping_address as {
      street: string; city: string; state?: string; zip?: string; country: string;
    } | null;

    sendOrderConfirmation({
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      items,
      subtotal: order.subtotal,
      total: order.total,
      shippingAddress: shipping ?? { street: "", city: "", country: "" },
    }).catch((err) => console.error("[email] capture email error:", err));

    return NextResponse.json({
      success: true,
      orderId,
      status: "paid",
      captureId: validated.captureId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal capture error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
