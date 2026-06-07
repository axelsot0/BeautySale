"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

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
  const slug = slugify(parsed.data.slug || store_name);
  if (!slug) return { error: "Slug inválido" };

  const supabase = createServiceClient();

  // Slug must be free.
  const { data: slugTaken } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (slugTaken) return { error: `El slug "${slug}" ya está en uso` };

  // Email must not already be an admin/superadmin.
  const { data: emailTaken } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (emailTaken) return { error: "Ese email ya pertenece a una cuenta" };

  // Create or reuse the auth user.
  const { data: authList } = await supabase.auth.admin.listUsers();
  let authUser = authList.users.find((u) => u.email?.toLowerCase() === email);
  if (authUser) {
    await supabase.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: { ...(authUser.user_metadata ?? {}), full_name, is_admin: true },
    });
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, is_admin: true },
    });
    if (error || !data.user) return { error: `Auth error: ${error?.message ?? "unknown"}` };
    authUser = data.user;
  }

  // Create the tenant owned by this superadmin.
  const { data: tenant, error: tErr } = await supabase
    .from("tenants")
    .insert({ slug, name: store_name, owner_id: authUser.id, active: true, created_by: me.id })
    .select("id")
    .single();
  if (tErr || !tenant) return { error: `No se pudo crear la tienda: ${tErr?.message ?? "?"}` };

  // Authoritative claims on the JWT.
  await supabase.auth.admin.updateUserById(authUser.id, {
    app_metadata: {
      ...(authUser.app_metadata ?? {}),
      is_admin: true,
      role: "superadmin",
      tenant_id: tenant.id,
      active: true,
    },
  });

  // Membership row.
  const { error: mErr } = await supabase.from("admins").insert({
    user_id: authUser.id,
    email,
    full_name,
    role: "superadmin",
    tenant_id: tenant.id,
    active: true,
    created_by: me.id,
  });
  if (mErr) return { error: `No se pudo crear la membresía: ${mErr.message}` };

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
