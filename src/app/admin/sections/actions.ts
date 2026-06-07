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
  const dir = String(formData.get("dir") ?? ""); // up | down
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
  await supabase.from("sections").update({ position: b.position }).eq("id", a.id);
  await supabase.from("sections").update({ position: a.position }).eq("id", b.id);
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

  let config: SectionConfig = {};
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
      config = { source, category_slug: source === "category" ? g("category_slug") : undefined, eyebrow: g("eyebrow"), title: g("title") };
      break;
    }
    case "mosaic":
      config = { eyebrow: g("eyebrow"), title: g("title") };
      break;
    case "newsletter":
      config = { title: g("title"), subtitle: g("subtitle") };
      break;
    default:
      config = {};
  }

  const supabase = createServiceClient();
  await supabase.from("sections").update({ config }).eq("id", id).eq("tenant_id", tenantId);
  revalidate();
}
