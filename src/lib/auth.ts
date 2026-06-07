import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Check admin status against the public.admins DB table.
 * Falls back to ADMIN_EMAILS env var if the table doesn't exist yet
 * (boot-strap safety for first deploy).
 */
export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  // DB lookup (source of truth)
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (!error && data) return true;
  } catch {
    // fall through to env fallback
  }

  // Env fallback (only used during initial setup before DB has any admin)
  const envEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return envEmails.includes(email.toLowerCase());
}

/**
 * Returns the current authenticated admin user or null.
 */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  const isAdmin = await isAdminEmail(user.email);
  if (!isAdmin) return null;
  return user;
}

export type AdminMembership = {
  role: "developer" | "superadmin" | "admin";
  tenant_id: number | null;
  active: boolean;
};

/**
 * Loads the authoritative membership (role/tenant/active) from the admins table
 * and writes it into the user's app_metadata so the JWT carries the claims.
 * Returns the membership, or null if the email is not an admin.
 */
export async function syncAdminClaims(
  userId: string,
  email: string,
): Promise<AdminMembership | null> {
  const admin = createServiceClient();
  const { data } = await admin
    .from("admins")
    .select("role, tenant_id, active")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (!data) return null;

  await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      is_admin: true,
      role: data.role,
      tenant_id: data.tenant_id,
      active: data.active,
    },
  });

  return data as AdminMembership;
}

/**
 * Reads role/tenant claims from the current session JWT (app_metadata).
 * Falls back to nulls when absent. Use for gating; the DB stays source of truth.
 */
export async function getAdminClaims(): Promise<{
  role: string | null;
  tenantId: number | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const meta = (user?.app_metadata ?? {}) as { role?: string; tenant_id?: number | null };
  return { role: meta.role ?? null, tenantId: meta.tenant_id ?? null };
}
