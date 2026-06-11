"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";
import { slugify } from "@/lib/utils";

async function ensureAdmin(): Promise<number> {
  const user = await getAdminUser();
  if (!user) throw new Error("unauthorized");
  return getAdminTenantId();
}

export type StepState = { ok?: boolean; error?: string };

// Paso 1: nombre de la tienda
export async function saveStoreBasics(_prev: StepState, formData: FormData): Promise<StepState> {
  const tenantId = await ensureAdmin();
  const name = String(formData.get("site_name") ?? "").trim();
  if (!name || name.length > 60) return { error: "Nombre inválido (máx. 60)" };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tenants")
    .update({ site_name: name, name })
    .eq("id", tenantId);
  if (error) return { error: error.message };
  return { ok: true };
}

// Paso 2: primera categoría
export async function createFirstCategory(_prev: StepState, formData: FormData): Promise<StepState> {
  const tenantId = await ensureAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 80) return { error: "Nombre inválido" };

  const supabase = createServiceClient();
  const slug = slugify(name);
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return { ok: true };

  const { error } = await supabase
    .from("categories")
    .insert({ tenant_id: tenantId, name, slug, color: "#FF7A59", position: 0 });
  if (error) return { error: error.message };
  return { ok: true };
}

const productSchema = z.object({
  title: z.string().min(1).max(160),
  price: z.coerce.number().positive(),
});

// Paso 3: primer producto (en la primera categoría de la tienda)
export async function createFirstProduct(_prev: StepState, formData: FormData): Promise<StepState> {
  const tenantId = await ensureAdmin();
  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("price"),
  });
  if (!parsed.success) return { error: "Revisá título y precio" };

  const supabase = createServiceClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("tenant_id", tenantId)
    .order("position")
    .limit(1)
    .maybeSingle();

  const { title, price } = parsed.data;
  const { error } = await supabase.from("products").insert({
    tenant_id: tenantId,
    title,
    slug: slugify(title),
    description: "",
    price,
    stock: 10,
    category_id: cat?.id ?? null,
    featured: true,
    images: [],
  });
  if (error) return { error: error.message };
  return { ok: true };
}

// Paso 4: hero de portada
export async function saveWelcomeHero(_prev: StepState, formData: FormData): Promise<StepState> {
  const tenantId = await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  if (!title || title.length > 120) return { error: "Título inválido (máx. 120)" };

  const supabase = createServiceClient();
  const { data: hero } = await supabase
    .from("banners")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("slot", "hero")
    .limit(1)
    .maybeSingle();

  const payload = {
    title,
    subtitle: subtitle || null,
    cta_label: "Comprar ahora",
    link: "/productos",
    slot: "hero" as const,
    position: 0,
    active: true,
    image_url: "",
  };

  const { error } = hero
    ? await supabase.from("banners").update(payload).eq("id", hero.id).eq("tenant_id", tenantId)
    : await supabase.from("banners").insert({ ...payload, tenant_id: tenantId });
  if (error) return { error: error.message };
  return { ok: true };
}
