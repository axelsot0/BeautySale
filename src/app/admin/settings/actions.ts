"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";

async function ensureAdmin(): Promise<number> {
  const u = await getAdminUser();
  if (!u) throw new Error("unauthorized");
  return getAdminTenantId();
}

export type SettingsState = { ok?: boolean; error?: string };

function revalidateAll() {
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

// ── PayPal ───────────────────────────────────────────────────────────────────

export async function savePayPal(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const tenantId = await ensureAdmin();

  const clientId    = String(formData.get("paypal_client_id") ?? "").trim();
  const secretInput = String(formData.get("paypal_secret") ?? "").trim();
  const mode        = String(formData.get("paypal_mode") ?? "sandbox") === "live" ? "live" : "sandbox";
  const clear       = formData.get("clear") === "true";

  const supabase = createServiceClient();

  if (clear) {
    const { error } = await supabase
      .from("tenants")
      .update({ paypal_client_id: null, paypal_secret: null, paypal_mode: "sandbox" })
      .eq("id", tenantId);
    if (error) return { error: error.message };
    revalidateAll();
    return { ok: true };
  }

  const { data: existing } = await supabase
    .from("tenants")
    .select("paypal_secret")
    .eq("id", tenantId)
    .single();
  const secret = secretInput || (existing?.paypal_secret as string | null) || "";

  if (!clientId || !secret) return { error: "Ingresá Client ID y Secret." };

  const { error } = await supabase
    .from("tenants")
    .update({ paypal_client_id: clientId, paypal_secret: secret, paypal_mode: mode })
    .eq("id", tenantId);
  if (error) return { error: error.message };

  revalidateAll();
  return { ok: true };
}

// ── Site name + social ────────────────────────────────────────────────────────

export type ThemeState = { ok?: boolean; error?: string };

export async function saveSiteName(
  _prev: ThemeState,
  formData: FormData,
): Promise<ThemeState> {
  const tenantId = await ensureAdmin();
  const siteName = String(formData.get("site_name") ?? "").trim();
  if (!siteName) return { error: "El nombre no puede estar vacío." };
  const supabase = createServiceClient();
  const { error } = await supabase.from("tenants").update({ site_name: siteName }).eq("id", tenantId);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function saveSocialLinks(
  _prev: ThemeState,
  formData: FormData,
): Promise<ThemeState> {
  const tenantId = await ensureAdmin();
  const KEYS = ["instagram", "tiktok", "whatsapp", "facebook", "email"] as const;
  const links: Record<string, { active: boolean; url: string }> = {};
  for (const k of KEYS) {
    links[k] = {
      active: formData.get(`${k}_active`) === "on",
      url:    String(formData.get(`${k}_url`) ?? "").trim(),
    };
  }
  const supabase = createServiceClient();
  const { error } = await supabase.from("tenants").update({ social_links: links }).eq("id", tenantId);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── Nav links ────────────────────────────────────────────────────────────────

export async function saveNavLinks(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const tenantId = await ensureAdmin();
  let links: unknown;
  try {
    links = JSON.parse(String(formData.get("nav_links") ?? "[]"));
  } catch {
    return { error: "Formato inválido" };
  }
  if (!Array.isArray(links)) return { error: "Formato inválido" };

  const supabase = createServiceClient();
  const { error } = await supabase.from("tenants").update({ nav_links: links }).eq("id", tenantId);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── Footer config ─────────────────────────────────────────────────────────────

export async function saveFooterConfig(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const tenantId = await ensureAdmin();

  let contact: unknown, nosotros: unknown, payments: unknown;
  try {
    contact  = JSON.parse(String(formData.get("footer_contact")  ?? "[]"));
    nosotros = JSON.parse(String(formData.get("footer_nosotros") ?? "[]"));
    payments = JSON.parse(String(formData.get("footer_payments") ?? "[]"));
  } catch {
    return { error: "Formato inválido" };
  }

  const description = String(formData.get("footer_description") ?? "").trim();

  const supabase = createServiceClient();
  const { error } = await supabase.from("tenants").update({
    footer_description: description || null,
    footer_contact:     contact,
    footer_nosotros:    nosotros,
    footer_payments:    payments,
  }).eq("id", tenantId);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── WhatsApp checkout ─────────────────────────────────────────────────────────

export async function saveWhatsappCheckout(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const tenantId = await ensureAdmin();
  const number = String(formData.get("whatsapp_checkout") ?? "").trim();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tenants")
    .update({ whatsapp_checkout: number })
    .eq("id", tenantId);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── Newsletter config ─────────────────────────────────────────────────────────

export async function saveNewsletterSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const tenantId = await ensureAdmin();

  const title    = String(formData.get("newsletter_title")    ?? "").trim() || null;
  const subtitle = String(formData.get("newsletter_subtitle") ?? "").trim() || null;
  const pct      = parseInt(String(formData.get("newsletter_discount_pct") ?? "10"), 10);

  const supabase = createServiceClient();
  const { error } = await supabase.from("tenants").update({
    newsletter_title:        title,
    newsletter_subtitle:     subtitle,
    newsletter_discount_pct: isNaN(pct) ? 10 : Math.max(1, Math.min(100, pct)),
  }).eq("id", tenantId);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}
