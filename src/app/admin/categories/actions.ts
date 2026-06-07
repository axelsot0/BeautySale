"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";
import { slugify } from "@/lib/utils";
import { uploadImage, deleteImageByUrl } from "@/lib/storage";

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().max(8).optional(),
  position: z.coerce.number().int().min(0).default(0),
});

export type CategoryFormState = { error?: string; fieldErrors?: Record<string, string> };

async function ensureAdmin(): Promise<number> {
  const user = await getAdminUser();
  if (!user) throw new Error("unauthorized");
  return getAdminTenantId();
}

export async function saveCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const tenantId = await ensureAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    color: formData.get("color"),
    icon: formData.get("icon") || undefined,
    position: formData.get("position") || 0,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Revisá los campos", fieldErrors };
  }

  const { id, name, slug, color, icon, position } = parsed.data;
  const finalSlug = slug ? slugify(slug) : slugify(name);
  const supabase = createServiceClient();

  // Handle image upload
  let image_url: string | undefined;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      image_url = await uploadImage(imageFile, "category-images", "categories");
    } catch (err) {
      return { error: `Error subiendo imagen: ${err instanceof Error ? err.message : "desconocido"}` };
    }
  }

  const existingUrl = String(formData.get("existing_image_url") ?? "") || null;
  const finalImageUrl = image_url ?? existingUrl;

  const payload = {
    name,
    slug: finalSlug,
    color,
    icon: icon || null,
    position,
    image_url: finalImageUrl,
  };

  if (id) {
    // Delete old image from storage if replaced
    if (image_url && existingUrl && existingUrl !== image_url) {
      await deleteImageByUrl(existingUrl, "category-images");
    }
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("categories").insert({ ...payload, tenant_id: tenantId });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  const { data } = await supabase.from("categories").select("image_url").eq("id", id).single();
  if (data?.image_url) {
    await deleteImageByUrl(data.image_url, "category-images");
  }

  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
