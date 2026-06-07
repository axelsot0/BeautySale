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
  title: z.string().min(1).max(160),
  slug: z.string().max(160).optional(),
  description: z.string().max(2000).default(""),
  price: z.coerce.number().positive(),
  discount_percent: z.coerce.number().int().min(0).max(99).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  category_id: z.string().uuid().nullable().optional(),
  featured: z.boolean().default(false),
  on_sale: z.boolean().default(false),
});

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> };

async function ensureAdmin(): Promise<number> {
  const user = await getAdminUser();
  if (!user) throw new Error("unauthorized");
  return getAdminTenantId();
}

export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const tenantId = await ensureAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || "",
    price: formData.get("price"),
    discount_percent: formData.get("discount_percent") || 0,
    stock: formData.get("stock") || 0,
    category_id: formData.get("category_id") || null,
    featured: formData.get("featured") === "on",
    on_sale: formData.get("on_sale") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Revisá los campos", fieldErrors };
  }

  const { id, title, slug, description, price, discount_percent, stock, category_id, featured, on_sale } = parsed.data;
  const finalSlug = slug ? slugify(slug) : slugify(title);

  // Upload new images
  const newImageFiles = formData.getAll("new_images") as File[];
  const uploadedUrls: string[] = [];
  for (const file of newImageFiles) {
    if (file.size === 0) continue;
    try {
      const url = await uploadImage(file, "product-images", "products");
      uploadedUrls.push(url);
    } catch (err) {
      return { error: `Error subiendo imagen: ${err instanceof Error ? err.message : "desconocido"}` };
    }
  }

  // Existing images kept (sent as hidden inputs)
  const existingImages = formData.getAll("existing_images") as string[];
  const images = [...existingImages, ...uploadedUrls];

  const supabase = createServiceClient();
  const payload = {
    title,
    slug: finalSlug,
    description,
    price,
    discount_percent,
    stock,
    category_id: category_id || null,
    featured,
    on_sale,
    images,
  };

  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("products").insert({ ...payload, tenant_id: tenantId });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();

  // Fetch images to delete from storage
  const { data } = await supabase.from("products").select("images").eq("id", id).single();
  if (data?.images?.length) {
    for (const url of data.images) {
      await deleteImageByUrl(url, "product-images");
    }
  }

  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function toggleProductFeatured(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const current = formData.get("current") === "true";
  if (!id) return;

  const supabase = createServiceClient();
  await supabase.from("products").update({ featured: !current }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function toggleProductOnSale(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const current = formData.get("current") === "true";
  if (!id) return;

  const supabase = createServiceClient();
  await supabase.from("products").update({ on_sale: !current }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function removeProductImage(formData: FormData) {
  await ensureAdmin();
  const productId = String(formData.get("product_id") ?? "");
  const imageUrl = String(formData.get("image_url") ?? "");
  if (!productId || !imageUrl) return;

  const supabase = createServiceClient();
  const { data } = await supabase.from("products").select("images").eq("id", productId).single();
  if (!data) return;

  const updated = (data.images ?? []).filter((u: string) => u !== imageUrl);
  await supabase.from("products").update({ images: updated }).eq("id", productId);
  await deleteImageByUrl(imageUrl, "product-images");

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}
