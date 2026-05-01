import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadBucket = "product-images" | "banner-images" | "category-images";

function randomKey(prefix: string, ext: string) {
  const id = crypto.randomUUID();
  return `${prefix}/${id}.${ext}`;
}

function extFromMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "bin";
}

/**
 * Uploads a single image File to a Supabase Storage bucket and returns the public URL.
 * Throws on invalid mime/size or upload failure.
 */
export async function uploadImage(
  file: File,
  bucket: UploadBucket,
  prefix = "uploads",
): Promise<string> {
  if (file.size === 0) throw new Error("archivo vacío");
  if (file.size > MAX_BYTES) throw new Error("archivo excede 5MB");
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("formato inválido (JPG/PNG/WEBP/AVIF)");
  }

  const supabase = createServiceClient();
  const key = randomKey(prefix, extFromMime(file.type));

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`upload falló: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Removes a stored object given its public URL. Best-effort: silently ignores errors
 * (e.g. URL doesn't match expected pattern, object already gone).
 */
export async function deleteImageByUrl(url: string, bucket: UploadBucket) {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const key = url.slice(idx + marker.length);
    if (!key) return;

    const supabase = createServiceClient();
    await supabase.storage.from(bucket).remove([key]);
  } catch {
    // ignore
  }
}
