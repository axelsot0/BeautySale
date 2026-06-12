"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId, getAdminMembership } from "@/lib/tenant-context";
import { getTenantStatus } from "@/lib/demo-server";
import {
  defaultConfig,
  parseCustomBlocks,
  MAX_CUSTOM_BLOCKS,
  type SectionType,
  type SectionConfig,
} from "@/lib/sections";
import { uploadImage } from "@/lib/storage";

async function ensureAdmin(): Promise<number> {
  const u = await getAdminUser();
  if (!u) throw new Error("unauthorized");
  return getAdminTenantId();
}

async function canEditSections(tenantId: number): Promise<boolean> {
  const m = await getAdminMembership();
  if (m?.role === "developer") return true;
  const status = await getTenantStatus(tenantId);
  return !status.isDemo;
}

// Custom sections are Pro-only. Developers can always edit them.
async function canUseCustomSections(tenantId: number): Promise<boolean> {
  const m = await getAdminMembership();
  if (m?.role === "developer") return true;
  const status = await getTenantStatus(tenantId);
  return status.plan === "pro";
}

function revalidate() {
  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
}

const TYPES: SectionType[] = [
  "banner",
  "product_carousel",
  "mosaic",
  "flash_sale",
  "brand_strip",
  "newsletter",
  "custom",
];

export async function addSection(formData: FormData) {
  const tenantId = await ensureAdmin();
  if (!(await canEditSections(tenantId))) return;

  const type = String(formData.get("type") ?? "") as SectionType;
  if (!TYPES.includes(type)) return;
  if (type === "custom" && !(await canUseCustomSections(tenantId))) return;

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
  if (!(await canEditSections(tenantId))) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createServiceClient();
  await supabase.from("sections").delete().eq("id", id).eq("tenant_id", tenantId);
  revalidate();
}

export async function toggleSection(formData: FormData) {
  const tenantId = await ensureAdmin();
  if (!(await canEditSections(tenantId))) return;

  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  const supabase = createServiceClient();
  await supabase.from("sections").update({ active }).eq("id", id).eq("tenant_id", tenantId);
  revalidate();
}

export async function moveSection(formData: FormData) {
  const tenantId = await ensureAdmin();
  if (!(await canEditSections(tenantId))) return;

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

export async function reorderSections(formData: FormData) {
  const tenantId = await ensureAdmin();
  if (!(await canEditSections(tenantId))) return;

  let ids: string[];
  try {
    ids = JSON.parse(String(formData.get("ids") ?? "[]"));
  } catch {
    return;
  }
  if (!Array.isArray(ids) || ids.length === 0) return;

  const supabase = createServiceClient();
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
  if (!(await canEditSections(tenantId))) return;

  const id = String(formData.get("id") ?? "");
  const type = String(formData.get("type") ?? "") as SectionType;
  if (!id) return;

  const g = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v || undefined;
  };

  const supabase = createServiceClient();

  if (type === "newsletter") {
    const pct = parseInt(String(formData.get("discount_pct") ?? "10"), 10);
    await supabase.from("tenants").update({
      newsletter_title: g("title") ?? null,
      newsletter_subtitle: g("subtitle") ?? null,
      newsletter_discount_pct: isNaN(pct) ? 10 : Math.max(1, Math.min(100, pct)),
    }).eq("id", tenantId);
    revalidate();
    return;
  }

  let config: SectionConfig = {};
  if (type === "custom") {
    if (!(await canUseCustomSections(tenantId))) return;
    const blocks = parseCustomBlocks(String(formData.get("blocks_json") ?? "")).slice(0, MAX_CUSTOM_BLOCKS);
    config = { blocks_json: JSON.stringify(blocks) };
    await supabase.from("sections").update({ config }).eq("id", id).eq("tenant_id", tenantId);
    revalidate();
    return;
  }

  switch (type) {
    case "banner":
      config = {
        title: g("title"),
        subtitle: g("subtitle"),
        image_url: g("image_url"),
        cta_label: g("cta_label"),
        cta_link: g("cta_link"),
        bg_color: g("bg_color") || "#FF4D8B",
      };
      break;
    case "product_carousel": {
      const source = String(formData.get("source") ?? "featured") === "category" ? "category" : "featured";
      config = {
        source,
        category_slug: source === "category" ? g("category_slug") : undefined,
        eyebrow: g("eyebrow"),
        title: g("title"),
      };
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

export async function uploadSectionImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const tenantId = await ensureAdmin();
  if (!(await canEditSections(tenantId))) return { error: "Disponible al activar tu tienda." };

  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Sin archivo" };

  try {
    return { url: await uploadImage(file, "section-images", String(tenantId)) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al subir" };
  }
}
