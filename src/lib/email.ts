import { Resend } from "resend";

// Lazy init — avoids "Missing API key" error at build time when env not set
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "placeholder");
  return _resend;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface ShippingAddress {
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
}

export interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  shippingAddress: ShippingAddress;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `US$ ${n.toFixed(2).replace(".", ",")}`;
}

// ── HTML Template ─────────────────────────────────────────────────────────────

function buildOrderEmail(data: OrderConfirmationData): string {
  const { orderId, customerName, items, subtotal, total, shippingAddress } = data;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0e8f5;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="48" style="padding-right:12px;vertical-align:top;">
                ${
                  item.image
                    ? `<img src="${item.image}" width="48" height="48" style="border-radius:12px;object-fit:cover;" alt="${item.title}" />`
                    : `<div style="width:48px;height:48px;border-radius:12px;background:#E5DEFF;display:flex;align-items:center;justify-content:center;">
                        <span style="font-size:20px;font-weight:700;color:#2D1B4E;">${item.title.charAt(0)}</span>
                       </div>`
                }
              </td>
              <td style="vertical-align:top;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#2D1B4E;">${item.title}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#5C4A82;">x${item.quantity} · ${fmt(item.price)} c/u</p>
              </td>
              <td style="vertical-align:top;text-align:right;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#2D1B4E;">${fmt(item.price * item.quantity)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`,
    )
    .join("");

  const addr = [
    shippingAddress.street,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.zip,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de pedido · BeautySale</title>
</head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:'Helvetica Neue',Arial,sans-serif;color:#2D1B4E;">

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFF8F0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;">

          <!-- Logo header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;color:#2D1B4E;">
                Beauty<span style="color:#FF4D8B;font-style:italic;">Sale</span>
              </h1>
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                style="background:linear-gradient(135deg,#FF4D8B,#B5A3E8);border-radius:24px;padding:32px;text-align:center;">
                <tr>
                  <td>
                    <div style="font-size:48px;margin-bottom:12px;">🎉</div>
                    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#fff;">
                      ¡Gracias por tu compra, ${customerName}!
                    </h2>
                    <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.9);">
                      Tu pedido fue confirmado y está en proceso.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="padding:20px 0 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                style="background:#fff;border-radius:16px;padding:16px 20px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#5C4A82;">
                      Número de orden
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;font-family:monospace;color:#2D1B4E;">
                      ${orderId}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:16px 0 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                style="background:#fff;border-radius:16px;padding:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#5C4A82;">
                      Tu pedido
                    </p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${itemRows}
                    </table>
                    <!-- Totals -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:12px;">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#5C4A82;">Subtotal</td>
                        <td style="padding:6px 0;font-size:13px;color:#5C4A82;text-align:right;">${fmt(subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#5C4A82;">Envío</td>
                        <td style="padding:6px 0;font-size:13px;color:#7DD3C0;text-align:right;font-weight:600;">A calcular</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0 0;font-size:16px;font-weight:800;color:#2D1B4E;border-top:2px solid #f0e8f5;">
                          Total
                        </td>
                        <td style="padding:10px 0 0;font-size:16px;font-weight:800;color:#FF4D8B;text-align:right;border-top:2px solid #f0e8f5;">
                          ${fmt(total)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping -->
          <tr>
            <td style="padding:16px 0 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                style="background:#fff;border-radius:16px;padding:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#5C4A82;">
                      Dirección de envío
                    </p>
                    <p style="margin:0;font-size:14px;color:#2D1B4E;line-height:1.5;">${addr}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}"
                style="display:inline-block;background:#FF4D8B;color:#fff;font-size:15px;font-weight:700;
                       padding:14px 32px;border-radius:999px;text-decoration:none;">
                Seguir comprando →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;padding-top:8px;border-top:1px solid #f0e8f5;">
              <p style="margin:16px 0 0;font-size:12px;color:#5C4A82;">
                © ${new Date().getFullYear()} BeautySale · Todos los derechos reservados
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#B5A3E8;">
                Este email fue enviado porque realizaste una compra en BeautySale.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ── Send ──────────────────────────────────────────────────────────────────────

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping confirmation email");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "BeautySale <onboarding@resend.dev>";

  const { error } = await getResend().emails.send({
    from,
    to: [data.customerEmail],
    subject: `¡Confirmación de tu pedido! 🎉 #${data.orderId.slice(0, 8).toUpperCase()}`,
    html: buildOrderEmail(data),
  });

  if (error) {
    console.error("[email] Failed to send order confirmation:", error);
  }
}
