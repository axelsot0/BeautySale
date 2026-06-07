import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

// Tenant the currently logged-in admin belongs to (their membership row).
// Falls back to the primary tenant during the single-store transition.
export async function getAdminTenantId(): Promise<number> {
  const user = await getAdminUser();
  if (!user?.email) return DEFAULT_TENANT_ID;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("admins")
    .select("tenant_id")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  return data?.tenant_id ?? DEFAULT_TENANT_ID;
}

export type Membership = {
  role: "developer" | "superadmin" | "admin";
  tenantId: number;
  email: string;
};

// Full membership (role + tenant) of the logged-in admin. DB is source of truth.
export async function getAdminMembership(): Promise<Membership | null> {
  const user = await getAdminUser();
  if (!user?.email) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("admins")
    .select("role, tenant_id")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  if (!data) return null;
  return {
    role: data.role as Membership["role"],
    tenantId: data.tenant_id ?? DEFAULT_TENANT_ID,
    email: user.email.toLowerCase(),
  };
}

// Roles allowed to manage other admins within a tenant.
export function canManageAdmins(role: string): boolean {
  return role === "developer" || role === "superadmin";
}
