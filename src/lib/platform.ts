// Datos de la plataforma (dueño del sistema). Client-safe.

// WhatsApp del dueño para cobros de suscripción por transferencia.
// Número RD (8297525036) con código de país +1.
export const PLATFORM_WHATSAPP = "18297525036";

export function platformWhatsAppUrl(message: string): string {
  return `https://wa.me/${PLATFORM_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
