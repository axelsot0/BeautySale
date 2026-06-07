"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminTenantId, getAdminMembership, canManageAdmins, type Membership } from "@/lib/tenant-context";

// Requires the caller to be a superadmin or developer.
async function requireManager(): Promise<Membership> {
  const m = await getAdminMembership();
  if (!m || !canManageAdmins(m.role)) throw new Error("forbidden");
  return m;
}

// Whether `caller` may delete/reset a target with the given role + tenant.
function canActOnTarget(
  caller: Membership,
  targetRole: string,
  targetTenantId: number | null,
): boolean {
  if (caller.role === "developer") return true;
  if (targetRole === "developer" || targetRole === "superadmin") return false;
  return targetTenantId === caller.tenantId;
}

const schema = z.object({
  email: z.string().email().toLowerCase(),
  full_name: z.string().min(1).max(120),
  password: z.string().min(6).max(72),
});

export type AdminFormState = { error?: string };

async function ensureAdmin() {
  const u = await getAdminUser();
  if (!u) throw new Error("unauthorized");
  return u;
}

export async function createAdmin(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const me = await ensureAdmin();
  await requireManager();

  const parsed = schema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Revisá los campos (email válido, nombre, password mín. 6 chars)" };
  }

  const { email, full_name, password } = parsed.data;
  const supabase = createServiceClient();

  // New admins belong to the creator's tenant.
  const tenantId = await getAdminTenantId();
  const appMeta = { is_admin: true, role: "admin", tenant_id: tenantId, active: true };

  // Check email isn't already an admin
  const { data: existing } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return { error: "Ese email ya es admin" };

  // Create or get auth user
  const { data: authList } = await supabase.auth.admin.listUsers();
  let authUser = authList.users.find((u) => u.email?.toLowerCase() === email);

  if (authUser) {
    // Existing auth user — update password + claims
    await supabase.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: { ...(authUser.user_metadata ?? {}), full_name, is_admin: true, role: "admin" },
      app_metadata: { ...(authUser.app_metadata ?? {}), ...appMeta },
    });
  } else {
    // Create new auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, is_admin: true, role: "admin" },
      app_metadata: appMeta,
    });
    if (error || !data.user) return { error: `Auth error: ${error?.message ?? "unknown"}` };
    authUser = data.user;
  }

  // Insert into admins table
  const { error: insertErr } = await supabase.from("admins").insert({
    user_id: authUser.id,
    email,
    full_name,
    role: "admin",
    tenant_id: tenantId,
    active: true,
    created_by: me.id,
  });
  if (insertErr) return { error: `DB error: ${insertErr.message}` };

  revalidatePath("/admin/admins");
  redirect("/admin/admins");
}

export async function deleteAdmin(formData: FormData) {
  const me = await ensureAdmin();
  const caller = await requireManager();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();

  // Get the admin row + auth user_id
  const { data: row } = await supabase
    .from("admins")
    .select("user_id, email, role, tenant_id")
    .eq("id", id)
    .single();
  if (!row) return;

  // Block self-deletion
  if (row.user_id === me.id) {
    throw new Error("No podés eliminarte a vos mismo");
  }

  // An admin/superadmin cannot remove the owner or cross-tenant accounts.
  if (!canActOnTarget(caller, row.role, row.tenant_id)) {
    throw new Error("No autorizado");
  }

  // Remove from admins table (auth.users keeps existing)
  await supabase.from("admins").delete().eq("id", id);

  // Resolve user_id (legacy rows may have it null)
  let userId = row.user_id;
  if (!userId && row.email) {
    const { data: list } = await supabase.auth.admin.listUsers();
    userId = list.users.find((u) => u.email?.toLowerCase() === row.email.toLowerCase())?.id ?? null;
  }

  // Revoke admin in JWT metadata so proxy gate stops letting them through
  if (userId) {
    const { data: u } = await supabase.auth.admin.getUserById(userId);
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { ...(u?.user?.user_metadata ?? {}), is_admin: false, role: undefined },
    });
  }

  revalidatePath("/admin/admins");
}

export type ResetState = { ok?: boolean; error?: string };

export async function resetAdminPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const caller = await requireManager();
  const id = String(formData.get("id") ?? "");
  const newPassword = String(formData.get("password") ?? "");
  if (!id || newPassword.length < 6) return { error: "Mínimo 6 caracteres" };

  const supabase = createServiceClient();
  const { data: row } = await supabase
    .from("admins")
    .select("user_id, email, role, tenant_id")
    .eq("id", id)
    .single();
  if (!row) return { error: "Admin no encontrado" };

  if (!canActOnTarget(caller, row.role, row.tenant_id)) {
    return { error: "No autorizado" };
  }

  // Resolve auth user_id (legacy rows may have it null — look up by email + backfill)
  let userId = row.user_id;
  if (!userId) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const match = list.users.find((u) => u.email?.toLowerCase() === row.email.toLowerCase());
    if (!match) return { error: "No existe un usuario de auth con ese email" };
    userId = match.id;
    await supabase.from("admins").update({ user_id: userId }).eq("id", id);
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/admins");
  return { ok: true };
}
