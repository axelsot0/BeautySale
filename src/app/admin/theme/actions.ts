"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";
import { uploadImage, deleteImageByUrl } from "@/lib/storage";
import { parsePalette, type Palette } from "@/lib/theme";
import { SOCIAL_NETWORKS, type SocialLinks } from "@/lib/social";

async function ensureAdmin(): Promise<number> {
  const u = await getAdminUser();
  if (!u) throw new Error("unauthorized");
  return getAdminTenantId();
}

function revalidateAll(id: string) {
  // Theme/logo live in the root layout → revalidate the whole tree.
  revalidatePath("/", "layout");
  revalidatePath(`/admin/theme`);
  void id;
}

export type ThemeState = { ok?: boolean; error?: string };

// Save a palette (preset or custom). Validates all 11 hex tokens server-side.
export async function saveTheme(_prev: ThemeState, formData: FormData): Promise<ThemeState> {
  const tenantId = await ensureAdmin();

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("palette") ?? ""));
  } catch {
    return { error: "Paleta inválida" };
  }

  const palette: Palette | null = parsePalette(raw);
  if (!palette) return { error: "Colores inválidos (se requieren 11 valores hex)" };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tenants")
    .update({ theme: palette })
    .eq("id", tenantId);
  if (error) return { error: error.message };

  revalidateAll("save");
  return { ok: true };
}

// Reset to the built-in default palette (theme = null).
export async function resetTheme(): Promise<ThemeState> {
  const tenantId = await ensureAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("platform_settings").update({ theme: null }).eq("id", 1);
  if (error) return { error: error.message };
  revalidateAll("reset");
  return { ok: true };
}

// Save a (already background-removed) logo PNG. Replaces the previous one.
export async function saveLogo(_prev: ThemeState, formData: FormData): Promise<ThemeState> {
  const tenantId = await ensureAdmin();

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) return { error: "Sin archivo" };

  let url: string;
  try {
    url = await uploadImage(file, "brand-assets", "logos");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al subir" };
  }

  const supabase = createServiceClient();
  const { data: prev } = await supabase
    .from("tenants")
    .select("logo_url")
    .eq("id", tenantId)
    .single();

  const { error } = await supabase.from("platform_settings").update({ logo_url: url }).eq("id", 1);
  if (error) return { error: error.message };

  if (prev?.logo_url) await deleteImageByUrl(prev.logo_url, "brand-assets");

  revalidateAll("logo");
  return { ok: true };
}

// Save the platform/site name. Empty => reset to default (null).
export async function saveSiteName(_prev: ThemeState, formData: FormData): Promise<ThemeState> {
  const tenantId = await ensureAdmin();
  const raw = String(formData.get("site_name") ?? "").trim();
  if (raw.length > 40) return { error: "Máximo 40 caracteres" };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tenants")
    .update({ site_name: raw || null })
    .eq("id", tenantId);
  if (error) return { error: error.message };

  revalidateAll("site-name");
  return { ok: true };
}

// Toggle demo mode (sample data fallback on the storefront).
export async function saveDemoMode(_prev: ThemeState, formData: FormData): Promise<ThemeState> {
  const tenantId = await ensureAdmin();
  const enabled = String(formData.get("demo_mode")) === "true";
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tenants")
    .update({ demo_mode: enabled })
    .eq("id", tenantId);
  if (error) return { error: error.message };
  revalidateAll("demo");
  return { ok: true };
}

// Save editorials (Mosaic) section heading. Empty => default (null).
export async function saveEditorialHeading(
  _prev: ThemeState,
  formData: FormData,
): Promise<ThemeState> {
  const tenantId = await ensureAdmin();
  const eyebrow = String(formData.get("editorial_eyebrow") ?? "").trim();
  const title = String(formData.get("editorial_title") ?? "").trim();
  if (eyebrow.length > 60 || title.length > 80) return { error: "Texto demasiado largo" };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tenants")
    .update({ editorial_eyebrow: eyebrow || null, editorial_title: title || null })
    .eq("id", tenantId);
  if (error) return { error: error.message };

  revalidateAll("editorial");
  return { ok: true };
}

// Save footer social links (active + url per network).
export async function saveSocialLinks(_prev: ThemeState, formData: FormData): Promise<ThemeState> {
  const tenantId = await ensureAdmin();

  const links = {} as SocialLinks;
  for (const n of SOCIAL_NETWORKS) {
    const url = String(formData.get(`${n.key}_url`) ?? "").trim().slice(0, 300);
    const active = formData.get(`${n.key}_active`) === "on";
    if (active && !url) return { error: `Falta URL para ${n.label}` };
    links[n.key] = { active, url };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("platform_settings").update({ social_links: links }).eq("id", 1);
  if (error) return { error: error.message };

  revalidateAll("social");
  return { ok: true };
}

export async function removeLogo(): Promise<ThemeState> {
  const tenantId = await ensureAdmin();
  const supabase = createServiceClient();
  const { data: prev } = await supabase
    .from("tenants")
    .select("logo_url")
    .eq("id", tenantId)
    .single();
  const { error } = await supabase.from("platform_settings").update({ logo_url: null }).eq("id", 1);
  if (error) return { error: error.message };
  if (prev?.logo_url) await deleteImageByUrl(prev.logo_url, "brand-assets");
  revalidateAll("logo-remove");
  return { ok: true };
}
