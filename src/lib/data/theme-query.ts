import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { DEFAULT_PALETTE, DEFAULT_SITE_NAME, parsePalette, type Palette } from "@/lib/theme";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export type NavLink = { label: string; href: string; highlight?: boolean };

export const DEFAULT_NAV: NavLink[] = [
  { label: "Todos",            href: "/productos" },
  { label: "Cuidado personal", href: "/c/cuidado-personal" },
  { label: "Ojos",             href: "/c/ojos" },
  { label: "Labios",           href: "/c/labios" },
  { label: "Rostro",           href: "/c/rostro" },
  { label: "Ofertas 🔥",       href: "/ofertas", highlight: true },
];

export type ActiveTheme = {
  palette: Palette;
  logoUrl: string | null;
  siteName: string;
  navLinks: NavLink[];
};

export async function getActiveTheme(
  tenantId: number = DEFAULT_TENANT_ID,
): Promise<ActiveTheme> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("theme, logo_url, site_name, nav_links")
      .eq("id", tenantId)
      .single();
    if (error || !data) return { palette: DEFAULT_PALETTE, logoUrl: null, siteName: DEFAULT_SITE_NAME, navLinks: DEFAULT_NAV };

    const palette = parsePalette(data.theme) ?? DEFAULT_PALETTE;
    const logoUrl = typeof data.logo_url === "string" && data.logo_url ? data.logo_url : null;
    const siteName =
      typeof data.site_name === "string" && data.site_name.trim() ? data.site_name.trim() : DEFAULT_SITE_NAME;
    const navLinks = Array.isArray(data.nav_links) && data.nav_links.length > 0
      ? (data.nav_links as NavLink[])
      : DEFAULT_NAV;
    return { palette, logoUrl, siteName, navLinks };
  } catch {
    return { palette: DEFAULT_PALETTE, logoUrl: null, siteName: DEFAULT_SITE_NAME, navLinks: DEFAULT_NAV };
  }
}

export type NewsletterConfig = { title: string; subtitle: string; discountPct: number };

export const DEFAULT_NEWSLETTER: NewsletterConfig = {
  title: "Sumate al Glow Squad",
  subtitle: "10% off en tu primera compra + tips de belleza, lanzamientos y mimos.",
  discountPct: 10,
};

export async function getNewsletterConfig(
  tenantId: number = DEFAULT_TENANT_ID,
): Promise<NewsletterConfig> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("tenants")
      .select("newsletter_title, newsletter_subtitle, newsletter_discount_pct")
      .eq("id", tenantId)
      .single();
    return {
      title: (data?.newsletter_title as string | null)?.trim() || DEFAULT_NEWSLETTER.title,
      subtitle: (data?.newsletter_subtitle as string | null)?.trim() || DEFAULT_NEWSLETTER.subtitle,
      discountPct: (data?.newsletter_discount_pct as number | null) ?? DEFAULT_NEWSLETTER.discountPct,
    };
  } catch {
    return DEFAULT_NEWSLETTER;
  }
}

export type FooterConfig = {
  description: string;
  contact: { label: string; href: string }[];
  nosotros: { label: string; href: string }[];
  payments: string[];
};

export const DEFAULT_FOOTER: FooterConfig = {
  description: "Productos de belleza, cuidado personal y accesorios. Hechos con cariño.",
  contact: [
    { label: "Centro de ayuda",          href: "/ayuda" },
    { label: "Envíos y entregas",         href: "/envios" },
    { label: "Cambios y devoluciones",    href: "/devoluciones" },
    { label: "Seguimiento de pedido",     href: "/seguimiento" },
    { label: "WhatsApp",                  href: "https://wa.me/" },
    { label: "hola@beautysale.shop",      href: "mailto:hola@beautysale.shop" },
  ],
  nosotros: [
    { label: "Sobre nosotros",            href: "/sobre" },
    { label: "Blog & rituales",           href: "/blog" },
    { label: "Trabajá con nosotros",      href: "/trabaja-con-nosotros" },
    { label: "Términos y condiciones",    href: "/terminos" },
    { label: "Privacidad",                href: "/privacidad" },
  ],
  payments: ["Visa", "Mastercard", "PayPal", "Mercado Pago", "Amex"],
};

export async function getFooterConfig(
  tenantId: number = DEFAULT_TENANT_ID,
): Promise<FooterConfig> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("tenants")
      .select("footer_description, footer_contact, footer_nosotros, footer_payments")
      .eq("id", tenantId)
      .single();
    return {
      description: (data?.footer_description as string | null)?.trim() || DEFAULT_FOOTER.description,
      contact: Array.isArray(data?.footer_contact) ? (data.footer_contact as { label: string; href: string }[]) : DEFAULT_FOOTER.contact,
      nosotros: Array.isArray(data?.footer_nosotros) ? (data.footer_nosotros as { label: string; href: string }[]) : DEFAULT_FOOTER.nosotros,
      payments: Array.isArray(data?.footer_payments) ? (data.footer_payments as string[]) : DEFAULT_FOOTER.payments,
    };
  } catch {
    return DEFAULT_FOOTER;
  }
}
