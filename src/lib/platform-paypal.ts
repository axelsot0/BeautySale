import "server-only";
import type { PayPalCreds } from "@/lib/paypal";

// Cuenta PayPal de la PLATAFORMA (dueño del sistema). Recibe los pagos de
// suscripción de los tenants. Independiente de las credenciales por tienda.
export function getPlatformPayPalCreds(): PayPalCreds | null {
  const clientId = process.env.PLATFORM_PAYPAL_CLIENT_ID ?? "";
  const secret = process.env.PLATFORM_PAYPAL_SECRET ?? "";
  if (!clientId || !secret) return null;
  const mode = process.env.PLATFORM_PAYPAL_MODE === "live" ? "live" : "sandbox";
  return { clientId, secret, mode };
}
