"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { uploadImage, deleteImageByUrl } from "@/lib/storage";

const SLOTS = ["hero", "mid", "sidebar"] as const;

const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(200).optional().nullable(),
  link: z.string().url().optional().nullable().or(z.literal("")),
  slot: z.enum(SLOTS).default("hero"),
  position: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export type BannerFormState = { error?: string; fieldErrors?: Record<string, string> };

async function ensureAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("unauthorized");
}

export async function saveBanner(
  _prev: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  await ensureAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || null,
    link: formData.get("link") || null,
    slot: formData.get("slot") || "hero",
    position: formData.get("position") || 0,
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Revisá los campos", fieldErrors };
  }

  const { id, title, subtitle, link, slot, position, active } = parsed.data;
  const supabase = createServiceClient();

  // Handle image upload
  let image_url: string | undefined;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      image_url = await uploadImage(imageFile, "banner-images", "banners");
    } catch (err) {
      return { error: `Error subiendo imagen: ${err instanceof Error ? err.message : "desconocido"}` };
    }
  }

  // If editing and no new image, keep existing
  const existingUrl = String(formData.get("existing_image_url") ?? "");

  const finalImageUrl = image_url ?? existingUrl;
  if (!finalImageUrl) return { error: "La imagen es obligatoria" };

  const payload = {
    title,
    subtitle: subtitle || null,
    link: link || null,
    slot,
    position,
    active,
    image_url: finalImageUrl,
  };

  if (id) {
    // If image changed, delete old one from storage
    if (image_url && existingUrl && existingUrl !== image_url) {
      await deleteImageByUrl(existingUrl, "banner-images");
    }
    const { error } = await supabase.from("banners").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("banners").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function deleteBanner(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  const { data } = await supabase.from("banners").select("image_url").eq("id", id).single();
  if (data?.image_url) {
    await deleteImageByUrl(data.image_url, "banner-images");
  }

  await supabase.from("banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function toggleBannerActive(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const current = formData.get("current") === "true";
  if (!id) return;

  const supabase = createServiceClient();
  await supabase.from("banners").update({ active: !current }).eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
