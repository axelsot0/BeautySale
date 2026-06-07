/**
 * PayPal REST API v2 helpers (server-only).
 * Docs: https://developer.paypal.com/docs/api/orders/v2/
 */

import { getPayPalConfig } from "@/lib/data/paypal-config";

function baseUrl(mode: "sandbox" | "live"): string {
  return mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

// ── Auth ─────────────────────────────────────────────────────────────────────

async function getAuth(): Promise<{ token: string; base: string }> {
  const { clientId, secret, mode } = await getPayPalConfig();

  if (!clientId || !secret) {
    throw new Error("PayPal no está configurado. Ingresá las credenciales en Ajustes.");
  }

  const base = baseUrl(mode);
  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${text}`);
  }

  const data = await res.json();
  return { token: data.access_token as string, base };
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PayPalOrderItem {
  name: string;
  quantity: string;       // string per PayPal spec
  unit_amount: { currency_code: string; value: string };
}

export interface CreatePayPalOrderInput {
  items: PayPalOrderItem[];
  subtotal: number;       // numeric, we'll format to 2dp string
  discount?: number;      // amount subtracted from item_total
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalOrderResult {
  id: string;             // PayPal order ID
  status: string;
  links: { href: string; rel: string; method: string }[];
}

// ── Create order ─────────────────────────────────────────────────────────────

export async function createPayPalOrder(
  input: CreatePayPalOrderInput,
): Promise<PayPalOrderResult> {
  const { token, base: BASE } = await getAuth();
  const currency = input.currency ?? "USD";
  const itemTotal = input.subtotal.toFixed(2);
  const discount = (input.discount ?? 0).toFixed(2);
  const total = (input.subtotal - (input.discount ?? 0)).toFixed(2);

  const breakdown: Record<string, { currency_code: string; value: string }> = {
    item_total: { currency_code: currency, value: itemTotal },
  };
  if ((input.discount ?? 0) > 0) {
    breakdown.discount = { currency_code: currency, value: discount };
  }

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: total,
          breakdown,
        },
        items: input.items,
      },
    ],
    application_context: {
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
      brand_name: "BeautySale",
      user_action: "PAY_NOW",
    },
  };

  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal createOrder failed: ${text}`);
  }

  return res.json() as Promise<PayPalOrderResult>;
}

// ── Capture order ─────────────────────────────────────────────────────────────

export interface PayPalCaptureResult {
  id: string;
  status: "COMPLETED" | "DECLINED" | "FAILED" | string;
  payer?: { email_address?: string; name?: { given_name?: string } };
}

export async function capturePayPalOrder(
  paypalOrderId: string,
): Promise<PayPalCaptureResult> {
  const { token, base: BASE } = await getAuth();

  const res = await fetch(`${BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed: ${text}`);
  }

  return res.json() as Promise<PayPalCaptureResult>;
}

// ── Verify order status (optional guard before capture) ───────────────────────

export async function getPayPalOrderStatus(paypalOrderId: string): Promise<string> {
  const { token, base: BASE } = await getAuth();

  const res = await fetch(`${BASE}/v2/checkout/orders/${paypalOrderId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("PayPal getOrder failed");
  const data = await res.json();
  return data.status as string;
}
