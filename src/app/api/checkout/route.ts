import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { createPayPalOrder } from "@/lib/paypal";
import { checkDiscountCode } from "@/lib/discount";
import { getStorefrontTenantId } from "@/lib/tenant-context";

// ── Validation ────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  price: z.number().positive(),
  quantity: z.number().int().positive().max(99),
  image: z.string().nullable().optional(),
});

const bodySchema = z.object({
  customer_name: z.string().min(1).max(120),
  customer_email: z.string().email(),
  shipping_address: z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
    zip: z.string().max(20).optional(),
    country: z.string().min(2).max(80),
  }),
  items: z.array(itemSchema).min(1).max(50),
  discount_code: z.string().max(40).optional(),
});

// ── POST /api/checkout ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { customer_name, customer_email, shipping_address, items, discount_code } = parsed.data;

  // 2. Calculate totals server-side (never trust client prices for final amount)
  //    We re-fetch prices from DB to prevent tampering.
  const supabase = createServiceClient();
  const productIds = [...new Set(items.map((i) => i.id))];

  // Validate all IDs are UUIDs — mock product IDs are not UUIDs and will cause a DB error
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const invalidIds = productIds.filter((id) => !UUID_RE.test(id));
  if (invalidIds.length > 0) {
    return NextResponse.json(
      { error: "Algunos productos no existen en el catálogo real. Actualizá la página y volvé a intentarlo." },
      { status: 422 },
    );
  }

  const tenantId = await getStorefrontTenantId();
  const { data: dbProducts, error: dbErr } = await supabase
    .from("products")
    .select("id, title, price, discount_percent, stock")
    .eq("tenant_id", tenantId)
    .in("id", productIds);

  if (dbErr) {
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }

  // Build a price map from DB (source of truth)
  const priceMap = new Map(
    dbProducts.map((p) => {
      const finalPrice =
        p.discount_percent > 0
          ? parseFloat((p.price * (1 - p.discount_percent / 100)).toFixed(2))
          : p.price;
      return [p.id, { title: p.title, price: finalPrice, stock: p.stock }];
    }),
  );

  // Validate all items exist + have stock
  for (const item of items) {
    const db = priceMap.get(item.id);
    if (!db) {
      return NextResponse.json(
        { error: `Producto no encontrado: ${item.title}` },
        { status: 422 },
      );
    }
    if (db.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stock insuficiente para: ${db.title}` },
        { status: 422 },
      );
    }
  }

  // Compute server-side subtotal
  const subtotal = parseFloat(
    items
      .reduce((sum, item) => {
        const db = priceMap.get(item.id)!;
        return sum + db.price * item.quantity;
      }, 0)
      .toFixed(2),
  );

  // 2b. Apply discount code server-side (never trust client-computed totals)
  let discountAmount = 0;
  let appliedCode: string | null = null;
  if (discount_code) {
    const check = await checkDiscountCode(discount_code, tenantId);
    if (check.valid) {
      discountAmount = parseFloat((subtotal * (check.percent / 100)).toFixed(2));
      appliedCode = discount_code.trim().toUpperCase();
    }
  }
  const total = parseFloat((subtotal - discountAmount).toFixed(2));

  // 3. Create Supabase order (status: pending)
  const orderItems = items.map((item) => {
    const db = priceMap.get(item.id)!;
    return {
      id: item.id,
      title: db.title,
      price: db.price,
      quantity: item.quantity,
      image: item.image ?? null,
    };
  });

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name,
      customer_email,
      shipping_address,
      items: orderItems,
      subtotal,
      total, // subtotal minus discount; no shipping fee for now
      discount_code: appliedCode,
      discount_amount: discountAmount,
      tenant_id: tenantId,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Error creando orden" }, { status: 500 });
  }

  // 4. Create PayPal order
  const origin = req.nextUrl.origin;

  try {
    const paypalOrder = await createPayPalOrder({
      items: items.map((item) => {
        const db = priceMap.get(item.id)!;
        return {
          name: db.title.slice(0, 127), // PayPal max 127 chars
          quantity: String(item.quantity),
          unit_amount: { currency_code: "USD", value: db.price.toFixed(2) },
        };
      }),
      subtotal,
      discount: discountAmount,
      returnUrl: `${origin}/checkout/success?orderId=${order.id}`,
      cancelUrl: `${origin}/checkout/cancel?orderId=${order.id}`,
    });

    // Save PayPal order ID in our order
    await supabase
      .from("orders")
      .update({ paypal_order_id: paypalOrder.id })
      .eq("id", order.id);

    // Find approval URL
    const approvalLink = paypalOrder.links.find((l) => l.rel === "approve");

    return NextResponse.json({
      orderId: order.id,
      paypalOrderId: paypalOrder.id,
      approvalUrl: approvalLink?.href ?? null,
    });
  } catch (err) {
    // PayPal failed — mark order as failed, return error
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);

    const message = err instanceof Error ? err.message : "PayPal error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
