"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";
import { uploadImage, deleteImageByUrl } from "@/lib/storage";
import { BRAND_STYLE_KEYS, DEFAULT_BRAND_STYLE } from "@/lib/brand-styles";

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(40),
  font_style: z.enum(BRAND_STYLE_KEYS as [string, ...string[]]).default(DEFAULT_BRAND_STYLE),
  position: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean().default(true),
});

export type BrandFormState = { error?: string };

async function ensureAdmin(): Promise<number> {
  const user = await getAdminUser();
  if (!user) throw new Error("unauthorized");
  return getAdminTenantId();
}

export async function saveBrand(_prev: BrandFormState, formData: FormData): Promise<BrandFormState> {
  const tenantId = await ensureAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    font_style: formData.get("font_style") || DEFAULT_BRAND_STYLE,
    position: formData.get("position") || 0,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: "Revisá los campos" };

  const { id, ...payload } = parsed.data;
  const supabase = createServiceClient();

  // Optional logo upload (overrides text wordmark when present).
  const file = formData.get("logo");
  let logoUrl: string | undefined;
  if (file instanceof File && file.size > 0) {
    try {
      logoUrl = await uploadImage(file, "brand-assets", "brand-logos");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Error al subir logo" };
    }
  }

  if (id) {
    const update = logoUrl ? { ...payload, logo_url: logoUrl } : payload;
    const { error } = await supabase.from("brands").update(update).eq("id", id).eq("tenant_id", tenantId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("brands").insert({ ...payload, logo_url: logoUrl ?? null, tenant_id: tenantId });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/brands");
  revalidatePath("/");
  redirect("/admin/brands");
}

export async function deleteBrand(formData: FormData) {
  const tenantId = await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  const { data } = await supabase.from("brands").select("logo_url").eq("id", id).eq("tenant_id", tenantId).single();
  await supabase.from("brands").delete().eq("id", id).eq("tenant_id", tenantId);
  if (data?.logo_url) await deleteImageByUrl(data.logo_url, "brand-assets");

  revalidatePath("/admin/brands");
  revalidatePath("/");
}

export async function toggleBrandActive(formData: FormData) {
  const tenantId = await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  const { data } = await supabase.from("brands").select("active").eq("id", id).eq("tenant_id", tenantId).single();
  if (!data) return;

  await supabase.from("brands").update({ active: !data.active }).eq("id", id).eq("tenant_id", tenantId);
  revalidatePath("/admin/brands");
  revalidatePath("/");
}
