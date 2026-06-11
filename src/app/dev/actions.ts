"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { ADMIN_TENANT_COOKIE } from "@/lib/tenant-context";
import { provisionStore, deleteTenantCascade } from "@/lib/provision";

// Only the platform owner (role=developer) may provision stores.
async function ensureDeveloper() {
  const u = await getAdminUser();
  if (!u?.email) throw new Error("unauthorized");
  const admin = createServiceClient();
  const { data } = await admin
    .from("admins")
    .select("id, role")
    .eq("email", u.email.toLowerCase())
    .maybeSingle();
  if (!data || data.role !== "developer") throw new Error("forbidden");
  return u;
}

const schema = z.object({
  email: z.string().email().toLowerCase(),
  full_name: z.string().min(1).max(120),
  password: z.string().min(6).max(72),
  store_name: z.string().min(1).max(60),
  slug: z.string().min(1).max(40).optional(),
});

export type DevState = { ok?: boolean; error?: string };

// Provision a new store: tenant + superadmin auth user + membership.
export async function createSuperAdmin(_prev: DevState, formData: FormData): Promise<DevState> {
  const me = await ensureDeveloper();

  const parsed = schema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    password: formData.get("password"),
    store_name: formData.get("store_name"),
    slug: formData.get("slug") || undefined,
  });
  if (!parsed.success) {
    return { error: "Revisá los campos (email válido, password mín. 6, nombre de tienda)" };
  }

  const { email, full_name, password, store_name } = parsed.data;

  // Developer-created stores are official (not demo) from the start.
  const result = await provisionStore({
    email,
    full_name,
    password,
    store_name,
    slug: parsed.data.slug,
    isDemo: false,
    createdBy: me.id,
  });
  if (!result.ok) return { error: result.error };

  revalidatePath("/dev");
  return { ok: true };
}

// Activate / deactivate a store. Deactivating cascades: its admins are blocked at login.
export async function setTenantActive(formData: FormData) {
  await ensureDeveloper();
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";
  if (!id) return;

  const supabase = createServiceClient();
  await supabase.from("tenants").update({ active }).eq("id", id);
  // Mirror onto memberships so app-level checks agree.
  await supabase.from("admins").update({ active }).eq("tenant_id", id).neq("role", "developer");

  revalidatePath("/dev");
}

// Assign a paid plan to a store (promotes demos to official) and record the
// payment. Billing is manual until PayPal subscriptions land (Fase C).
export async function setPlan(formData: FormData) {
  await ensureDeveloper();
  const id = Number(formData.get("id"));
  const plan = String(formData.get("plan") ?? "");
  const months = Math.max(1, Math.min(24, Number(formData.get("months")) || 1));
  const amount = Number(formData.get("amount"));
  if (!id || (plan !== "basic" && plan !== "pro")) return;

  const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();

  const supabase = createServiceClient();
  await supabase
    .from("tenants")
    .update({
      plan,
      plan_expires_at: expiresAt,
      is_demo: false,
      demo_expires_at: null,
      active: true,
    })
    .eq("id", id);
  await supabase.from("admins").update({ active: true }).eq("tenant_id", id).neq("role", "developer");

  if (Number.isFinite(amount) && amount >= 0) {
    await supabase.from("subscription_payments").insert({
      tenant_id: id,
      plan,
      months,
      amount,
      method: "manual",
    });
  }

  revalidatePath("/dev");
}

// Permanently delete a store and its data (cascade) + auth users.
export async function deleteTenant(formData: FormData) {
  await ensureDeveloper();
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteTenantCascade(id);
  revalidatePath("/dev");
}

// Developer: open a store's admin panel by setting the tenant-view cookie.
export async function enterStore(formData: FormData) {
  await ensureDeveloper();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  (await cookies()).set(ADMIN_TENANT_COOKIE, id, { path: "/", sameSite: "lax" });
  redirect("/admin");
}
