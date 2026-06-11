import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { checkDiscountCode } from "@/lib/discount";
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { formatPrice } from "@/lib/utils";

// ── Validation (same as PayPal route) ────────────────────────────────────────

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
  customer_phone: z.string().max(30).optional(),
  shipping_address: z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
    zip: z.string().max(20).optional(),
    country: z.string().min(2).max(80),
  }),
  items: z.array(itemSchema).min(1).max(50),
  discount_code: z.string().max(40).optional(),
  store_name: z.string().max(100).optional(),
});

// ── Build WhatsApp message ────────────────────────────────────────────────────

function buildMessage(params: {
  storeName: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address: { street: string; city: string; state?: string; zip?: string; country: string };
  orderItems: { title: string; price: number; quantity: number; image?: string | null }[];
  subtotal: number;
  discountAmount: number;
  discountCode: string | null;
  total: number;
}): string {
  const lines: string[] = [];

  lines.push(`*Nuevo pedido - ${params.storeName}*`);
  lines.push("");

  lines.push("*Datos de contacto*");
  lines.push(`Nombre: ${params.customerName}`);
  lines.push(`Email: ${params.customerEmail}`);
  if (params.customerPhone) lines.push(`Tel: ${params.customerPhone}`);
  lines.push("");

  lines.push("*Direccion de envio*");
  lines.push(params.address.street);
  const cityLine = [params.address.city, params.address.state, params.address.zip]
    .filter(Boolean)
    .join(", ");
  if (cityLine) lines.push(cityLine);
  lines.push(params.address.country);
  lines.push("");

  lines.push("*Resumen del pedido*");
  for (const item of params.orderItems) {
    lines.push(`- ${item.title} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`);
    if (item.image) lines.push(`  ${item.image}`);
  }
  lines.push("");

  if (params.discountAmount > 0 && params.discountCode) {
    lines.push(`Subtotal: ${formatPrice(params.subtotal)}`);
    lines.push(`Descuento (${params.discountCode}): -${formatPrice(params.discountAmount)}`);
  }
  lines.push(`*Total: ${formatPrice(params.total)}*`);
  lines.push("");
  lines.push(`Pedido #${params.orderId.slice(0, 8).toUpperCase()}`);

  return lines.join("\n");
}

// ── POST /api/checkout/whatsapp ───────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
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

  const {
    customer_name, customer_email, customer_phone,
    shipping_address, items, discount_code, store_name,
  } = parsed.data;

  const supabase = createServiceClient();
  const tenantId = await getStorefrontTenantId();

  // 1. Validate product IDs are UUIDs
  const productIds = [...new Set(items.map((i) => i.id))];
  const invalidIds = productIds.filter((id) => !UUID_RE.test(id));
  if (invalidIds.length > 0) {
    return NextResponse.json(
      { error: "Algunos productos no existen en el catalogo real. Actualizá la pagina." },
      { status: 422 },
    );
  }

  // 2. Fetch server-side prices + stock
  const { data: dbProducts, error: dbErr } = await supabase
    .from("products")
    .select("id, title, price, discount_percent, stock")
    .eq("tenant_id", tenantId)
    .in("id", productIds);

  if (dbErr) return NextResponse.json({ error: "Error fetching products" }, { status: 500 });

  const priceMap = new Map(
    dbProducts.map((p) => {
      const finalPrice =
        p.discount_percent > 0
          ? parseFloat((p.price * (1 - p.discount_percent / 100)).toFixed(2))
          : p.price;
      return [p.id, { title: p.title, price: finalPrice, stock: p.stock }];
    }),
  );

  for (const item of items) {
    const db = priceMap.get(item.id);
    if (!db) {
      return NextResponse.json({ error: `Producto no encontrado: ${item.title}` }, { status: 422 });
    }
    if (db.stock < item.quantity) {
      return NextResponse.json({ error: `Stock insuficiente para: ${db.title}` }, { status: 422 });
    }
  }

  // 3. Compute totals
  const subtotal = parseFloat(
    items.reduce((sum, item) => sum + priceMap.get(item.id)!.price * item.quantity, 0).toFixed(2),
  );

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

  // 4. Get tenant WA number + site name
  const { data: tenant } = await supabase
    .from("tenants")
    .select("whatsapp_checkout, site_name")
    .eq("id", tenantId)
    .single();

  const waNumber = (tenant?.whatsapp_checkout as string | null)?.replace(/\D/g, "") ?? "";
  if (!waNumber) {
    return NextResponse.json({ error: "WhatsApp checkout no configurado" }, { status: 400 });
  }

  // 5. Insert order
  const orderItems = items.map((item) => {
    const db = priceMap.get(item.id)!;
    return { id: item.id, title: db.title, price: db.price, quantity: item.quantity, image: item.image ?? null };
  });

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      tenant_id: tenantId,
      customer_name,
      customer_email,
      shipping_address,
      items: orderItems,
      subtotal,
      total,
      discount_code: appliedCode,
      discount_amount: discountAmount,
      status: "pending",
      source: "whatsapp",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Error creando orden" }, { status: 500 });
  }

  // 6. Build WA message + URL
  const siteName = store_name || (tenant?.site_name as string | null) || "Tienda";
  const message = buildMessage({
    storeName: siteName,
    orderId: order.id,
    customerName: customer_name,
    customerEmail: customer_email,
    customerPhone: customer_phone,
    address: shipping_address,
    orderItems,
    subtotal,
    discountAmount,
    discountCode: appliedCode,
    total,
  });

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  return NextResponse.json({ orderId: order.id, waUrl });
}
