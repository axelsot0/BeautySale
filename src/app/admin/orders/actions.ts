"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled", "declined", "failed"] as const;
export type OrderStatus = (typeof STATUSES)[number];

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUSES),
});

async function ensureAdmin() {
  const u = await getAdminUser();
  if (!u) throw new Error("unauthorized");
}

export async function updateOrderStatus(formData: FormData) {
  await ensureAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const supabase = createServiceClient();
  await supabase.from("orders").update({ status: parsed.data.status }).eq("id", parsed.data.id);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.id}`);
  revalidatePath("/admin");
}
