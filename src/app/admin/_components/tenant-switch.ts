"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminMembership, ADMIN_TENANT_COOKIE } from "@/lib/tenant-context";

// Developer-only: switch which store's admin panel is in view.
export async function switchTenant(formData: FormData) {
  const m = await getAdminMembership();
  if (m?.role !== "developer") return;
  const id = String(formData.get("tenant_id") ?? "");
  if (!id) return;
  (await cookies()).set(ADMIN_TENANT_COOKIE, id, { path: "/", sameSite: "lax" });
  revalidatePath("/admin", "layout");
}
