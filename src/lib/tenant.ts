import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

// Single-resolver abstraction. Today: path-based (/t/<slug>).
// Future subdomain support changes only tenantSlugFromHost + the middleware call.

export const DEFAULT_TENANT_ID = 1;
export const DEFAULT_TENANT_SLUG = "beautysale";

export type Tenant = {
  id: number;
  slug: string;
  name: string;
  active: boolean;
  owner_id: string | null;
};

// Extracts a tenant slug from a pathname like "/t/glow/..." → "glow".
export function tenantSlugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/t\/([^/]+)/);
  return m ? m[1].toLowerCase() : null;
}

// Reserved for future subdomain routing (glow.tuapp.com → "glow").
export function tenantSlugFromHost(host: string | null, rootDomain: string): string | null {
  if (!host) return null;
  const h = host.split(":")[0].toLowerCase();
  if (!h.endsWith(rootDomain)) return null;
  const sub = h.slice(0, -rootDomain.length).replace(/\.$/, "");
  if (!sub || sub === "www") return null;
  return sub;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("tenants")
    .select("id, slug, name, active, owner_id")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  return (data as Tenant | null) ?? null;
}

export async function getTenantById(id: number): Promise<Tenant | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("tenants")
    .select("id, slug, name, active, owner_id")
    .eq("id", id)
    .maybeSingle();
  return (data as Tenant | null) ?? null;
}
