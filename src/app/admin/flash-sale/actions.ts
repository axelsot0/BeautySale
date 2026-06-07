"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId } from "@/lib/tenant-context";

const schema = z.object({
  active: z.coerce.boolean().default(false),
  title: z.string().min(1).max(60),
  discount_label: z.string().min(1).max(30),
  description: z.string().min(1).max(300),
  cta_link: z.string().min(1).max(200),
  ends_at: z.string().optional(),
});

export type FlashFormState = { ok?: boolean; error?: string };

async function ensureAdmin(): Promise<number> {
  const user = await getAdminUser();
  if (!user) throw new Error("unauthorized");
  return getAdminTenantId();
}

export async function saveFlashSale(
  _prev: FlashFormState,
  formData: FormData,
): Promise<FlashFormState> {
  const tenantId = await ensureAdmin();

  const parsed = schema.safeParse({
    active: formData.get("active") === "on",
    title: formData.get("title"),
    discount_label: formData.get("discount_label"),
    description: formData.get("description"),
    cta_link: formData.get("cta_link"),
    ends_at: formData.get("ends_at") || undefined,
  });
  if (!parsed.success) return { error: "Revisá los campos" };

  const { ends_at, ...rest } = parsed.data;
  // datetime-local has no timezone; treat empty as null (rolling 24h in the component).
  const endsAtIso = ends_at ? new Date(ends_at).toISOString() : null;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("flash_sale")
    .upsert({ tenant_id: tenantId, ...rest, ends_at: endsAtIso }, { onConflict: "tenant_id" });
  if (error) return { error: error.message };

  revalidatePath("/admin/flash-sale");
  revalidatePath("/");
  return { ok: true };
}
