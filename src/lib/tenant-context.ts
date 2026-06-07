import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";
import { TENANT_COOKIE } from "@/lib/tenant-cookie";

// Resolves the storefront tenant for the current request from the tenant cookie.
// Falls back to the primary store. Cached per request.
export const getStorefrontTenantId = cache(async (): Promise<number> => {
  try {
    const slug = (await cookies()).get(TENANT_COOKIE)?.value;
    if (!slug) return DEFAULT_TENANT_ID;
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("tenants")
      .select("id, active")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();
    if (!data || data.active === false) return DEFAULT_TENANT_ID;
    return data.id;
  } catch {
    return DEFAULT_TENANT_ID;
  }
});

// Cookie a developer uses to view a specific store's admin panel.
export const ADMIN_TENANT_COOKIE = "bs_admin_tenant";

// Tenant whose admin panel is currently in view. Regular admins => their own
// tenant. Developers can override via the tenant switcher cookie.
export async function getAdminTenantId(): Promise<number> {
  const m = await getAdminMembership();
  if (!m) return DEFAULT_TENANT_ID;
  if (m.role === "developer") {
    const override = (await cookies()).get(ADMIN_TENANT_COOKIE)?.value;
    const id = override ? Number(override) : NaN;
    if (!Number.isNaN(id) && id > 0) return id;
  }
  return m.tenantId;
}

// All stores, for the developer tenant switcher.
export async function listTenants(): Promise<{ id: number; name: string }[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("tenants").select("id, name").order("id", { ascending: true });
  return data ?? [];
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
