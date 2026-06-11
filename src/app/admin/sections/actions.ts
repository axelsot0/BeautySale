"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";
import { defaultConfig, type SectionType, type SectionConfig } from "@/lib/sections";

async function ensureAdmin(): Promise<number> {
  const u = await getAdminUser();
  if (!u) throw new Error("unauthorized");
  return getAdminTenantId();
}

function revalidate() {
  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
}

const TYPES: SectionType[] = ["banner", "product_carousel", "mosaic", "flash_sale", "brand_strip", "newsletter"];

export async function addSection(formData: FormData) {
  const tenantId = await ensureAdmin();
  const type = String(formData.get("type") ?? "") as SectionType;
  if (!TYPES.includes(type)) return;

  const supabase = createServiceClient();
  const { data: last } = await supabase
    .from("sections")
    .select("position")
    .eq("tenant_id", tenantId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? -1) + 1;

  await supabase
    .from("sections")
    .insert({ tenant_id: tenantId, type, position, config: defaultConfig(type), active: true });
  revalidate();
}

export async function deleteSection(formData: FormData) {
  const tenantId = await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createServiceClient();
  await supabase.from("sections").delete().eq("id", id).eq("tenant_id", tenantId);
  revalidate();
}

export async function toggleSection(formData: FormData) {
  const tenantId = await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  const supabase = createServiceClient();
  await supabase.from("sections").update({ active }).eq("id", id).eq("tenant_id", tenantId);
  revalidate();
}

export async function moveSection(formData: FormData) {
  const tenantId = await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  const { data: rows } = await supabase
    .from("sections")
    .select("id, position")
    .eq("tenant_id", tenantId)
    .order("position", { ascending: true });
  if (!rows) return;

  const idx = rows.findIndex((r) => r.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= rows.length) return;

  const a = rows[idx];
  const b = rows[swapIdx];
  await supabase.from("sections").update({ position: b.position }).eq("id", a.id).eq("tenant_id", tenantId);
  await supabase.from("sections").update({ position: a.position }).eq("id", b.id).eq("tenant_id", tenantId);
  revalidate();
}

// Reordena todas las secciones según la lista de ids (drag & drop).
export async function reorderSections(formData: FormData) {
  const tenantId = await ensureAdmin();
  let ids: string[];
  try {
    ids = JSON.parse(String(formData.get("ids") ?? "[]"));
  } catch {
    return;
  }
  if (!Array.isArray(ids) || ids.length === 0) return;

  const supabase = createServiceClient();
  // Solo ids que pertenecen al tenant (ignora inyectados)
  const { data: own } = await supabase
    .from("sections")
    .select("id")
    .eq("tenant_id", tenantId);
  const ownSet = new Set((own ?? []).map((r) => r.id));

  let pos = 0;
  for (const id of ids) {
    if (!ownSet.has(id)) continue;
    await supabase.from("sections").update({ position: pos }).eq("id", id).eq("tenant_id", tenantId);
    pos++;
  }
  revalidate();
}

export async function updateSection(formData: FormData) {
  const tenantId = await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const type = String(formData.get("type") ?? "") as SectionType;
  if (!id) return;

  const g = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v || undefined;
  };

  const supabase = createServiceClient();

  // newsletter config writes to tenants, not sections.config
  if (type === "newsletter") {
    const pct = parseInt(String(formData.get("discount_pct") ?? "10"), 10);
    await supabase.from("tenants").update({
      newsletter_title:        g("title") ?? null,
      newsletter_subtitle:     g("subtitle") ?? null,
      newsletter_discount_pct: isNaN(pct) ? 10 : Math.max(1, Math.min(100, pct)),
    }).eq("id", tenantId);
    revalidate();
    return;
  }

  let config: SectionConfig = {};
  switch (type) {
    case "banner":
      config = {
        title:     g("title"),
        subtitle:  g("subtitle"),
        image_url: g("image_url"),
        cta_label: g("cta_label"),
        cta_link:  g("cta_link"),
        bg_color:  g("bg_color") || "#FF4D8B",
      };
      break;
    case "product_carousel": {
      const source = String(formData.get("source") ?? "featured") === "category" ? "category" : "featured";
      config = { source, category_slug: source === "category" ? g("category_slug") : undefined, eyebrow: g("eyebrow"), title: g("title") };
      break;
    }
    case "mosaic":
      config = { eyebrow: g("eyebrow"), title: g("title") };
      break;
    default:
      config = {};
  }

  await supabase.from("sections").update({ config }).eq("id", id).eq("tenant_id", tenantId);
  revalidate();
}

// Upload an image to Supabase storage bucket "section-images".
// Returns { url } on success or { error } on failure.
export async function uploadSectionImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const tenantId = await ensureAdmin();
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { error: "Sin archivo" };

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const allowed = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
  if (!allowed.includes(ext)) return { error: "Formato no soportado (jpg, png, webp, gif)" };
  if (file.size > 5 * 1024 * 1024) return { error: "Máximo 5 MB" };

  const path = `${tenantId}/${crypto.randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const supabase = createServiceClient();
  const { error: uploadError } = await supabase.storage
    .from("section-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("section-images").getPublicUrl(path);
  return { url: publicUrl };
}
