"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";

const schema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().min(1).max(140),
  active: z.coerce.boolean().default(true),
  position: z.coerce.number().int().min(0).default(0),
});

export type NewsFormState = { error?: string };

async function ensureAdmin(): Promise<number> {
  const user = await getAdminUser();
  if (!user) throw new Error("unauthorized");
  return getAdminTenantId();
}

export async function saveNews(_prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
  const tenantId = await ensureAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    text: formData.get("text"),
    active: formData.get("active") === "on",
    position: formData.get("position") || 0,
  });
  if (!parsed.success) return { error: "Revisá los campos" };

  const supabase = createServiceClient();
  const { id, ...payload } = parsed.data;

  if (id) {
    const { error } = await supabase.from("news").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("news").insert({ ...payload, tenant_id: tenantId });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/news");
  revalidatePath("/");
  redirect("/admin/news");
}

export async function deleteNews(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  await supabase.from("news").delete().eq("id", id);
  revalidatePath("/admin/news");
  revalidatePath("/");
}

export async function toggleNewsActive(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  const { data } = await supabase.from("news").select("active").eq("id", id).single();
  if (!data) return;

  await supabase.from("news").update({ active: !data.active }).eq("id", id);
  revalidatePath("/admin/news");
  revalidatePath("/");
}
