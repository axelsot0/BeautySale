import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { slugify } from "@/lib/utils";

export const DEMO_DURATION_DAYS = 15;

export type ProvisionInput = {
  email: string;
  full_name: string;
  password: string;
  store_name: string;
  slug?: string;
  isDemo: boolean;
  createdBy?: string | null;
};

export type ProvisionResult =
  | { ok: true; tenantId: number; userId: string; slug: string }
  | { ok: false; error: string };

// Provisions a store end-to-end: tenant + superadmin auth user + membership.
// Shared by the developer panel (isDemo=false) and public signup (isDemo=true).
export async function provisionStore(input: ProvisionInput): Promise<ProvisionResult> {
  const email = input.email.trim().toLowerCase();
  const slug = slugify(input.slug || input.store_name);
  if (!slug) return { ok: false, error: "Slug inválido" };

  const supabase = createServiceClient();

  // Slug must be free.
  const { data: slugTaken } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (slugTaken) return { ok: false, error: `El nombre "${slug}" ya está en uso, probá otro` };

  // Email must not already be an admin.
  const { data: emailTaken } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (emailTaken) return { ok: false, error: "Ese email ya pertenece a una cuenta" };

  // Create or reuse the auth user.
  const { data: authList } = await supabase.auth.admin.listUsers();
  let authUser = authList.users.find((u) => u.email?.toLowerCase() === email);
  if (authUser) {
    await supabase.auth.admin.updateUserById(authUser.id, {
      password: input.password,
      email_confirm: true,
      user_metadata: { ...(authUser.user_metadata ?? {}), full_name: input.full_name, is_admin: true },
    });
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.full_name, is_admin: true },
    });
    if (error || !data.user) return { ok: false, error: `Auth error: ${error?.message ?? "unknown"}` };
    authUser = data.user;
  }

  const demoExpiresAt = input.isDemo
    ? new Date(Date.now() + DEMO_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Create the tenant owned by this superadmin.
  const { data: tenant, error: tErr } = await supabase
    .from("tenants")
    .insert({
      slug,
      name: input.store_name,
      owner_id: authUser.id,
      active: true,
      is_demo: input.isDemo,
      demo_expires_at: demoExpiresAt,
      created_by: input.createdBy ?? null,
    })
    .select("id")
    .single();
  if (tErr || !tenant) return { ok: false, error: `No se pudo crear la tienda: ${tErr?.message ?? "?"}` };

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
    full_name: input.full_name,
    role: "superadmin",
    tenant_id: tenant.id,
    active: true,
    created_by: input.createdBy ?? null,
  });
  if (mErr) return { ok: false, error: `No se pudo crear la membresía: ${mErr.message}` };

  return { ok: true, tenantId: tenant.id, userId: authUser.id, slug };
}

// Fully removes a tenant: the tenants row cascades to all tenant_id-scoped
// tables (products, categories, banners, news, orders, brands, sections,
// flash_sale, admins, newsletter_subscribers). Auth users are deleted after.
export async function deleteTenantCascade(tenantId: number): Promise<void> {
  const supabase = createServiceClient();

  const { data: members } = await supabase
    .from("admins")
    .select("user_id, role")
    .eq("tenant_id", tenantId);

  // Delete the tenant — DB cascade clears every child row (incl. admins).
  await supabase.from("tenants").delete().eq("id", tenantId);

  // Remove the auth users that belonged to this store (best-effort). Never
  // delete a developer account.
  for (const m of members ?? []) {
    if (m.user_id && m.role !== "developer") {
      try {
        await supabase.auth.admin.deleteUser(m.user_id);
      } catch {
        // ignore — auth user may already be gone
      }
    }
  }
}
