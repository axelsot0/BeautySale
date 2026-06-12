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

type ServiceClient = ReturnType<typeof createServiceClient>;

async function cleanupProvision(
  supabase: ServiceClient,
  input: { tenantId?: number; authUserId?: string; deleteAuthUser?: boolean },
) {
  if (input.tenantId) {
    await supabase.from("tenants").delete().eq("id", input.tenantId);
  }

  if (input.authUserId && input.deleteAuthUser) {
    try {
      await supabase.auth.admin.deleteUser(input.authUserId);
    } catch {
      // Best effort. The original error is more useful to the caller.
    }
  }
}

// Provisions a store end-to-end: tenant + superadmin auth user + membership.
// Shared by the developer panel (isDemo=false) and public signup (isDemo=true).
export async function provisionStore(input: ProvisionInput): Promise<ProvisionResult> {
  const email = input.email.trim().toLowerCase();
  const slug = slugify(input.slug || input.store_name);
  if (!slug) return { ok: false, error: "Slug invalido" };

  const supabase = createServiceClient();

  const { data: slugTaken } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (slugTaken) return { ok: false, error: `El nombre "${slug}" ya esta en uso, proba otro` };

  const { data: emailTaken } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (emailTaken) return { ok: false, error: "Ese email ya pertenece a una cuenta" };

  const { data: authList } = await supabase.auth.admin.listUsers();
  let authUser = authList.users.find((u) => u.email?.toLowerCase() === email);
  const createdAuthUser = !authUser;

  if (!authUser) {
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

  const { data: tenant, error: tenantErr } = await supabase
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
  if (tenantErr || !tenant) {
    await cleanupProvision(supabase, { authUserId: authUser.id, deleteAuthUser: createdAuthUser });
    return { ok: false, error: `No se pudo crear la tienda: ${tenantErr?.message ?? "?"}` };
  }

  const { error: membershipErr } = await supabase.from("admins").insert({
    user_id: authUser.id,
    email,
    full_name: input.full_name,
    role: "superadmin",
    tenant_id: tenant.id,
    active: true,
    created_by: input.createdBy ?? null,
  });
  if (membershipErr) {
    await cleanupProvision(supabase, {
      tenantId: tenant.id,
      authUserId: authUser.id,
      deleteAuthUser: createdAuthUser,
    });
    return { ok: false, error: `No se pudo crear la membresia: ${membershipErr.message}` };
  }

  const { error: authUpdateErr } = await supabase.auth.admin.updateUserById(authUser.id, {
    ...(createdAuthUser ? {} : { password: input.password, email_confirm: true }),
    user_metadata: {
      ...(authUser.user_metadata ?? {}),
      full_name: input.full_name,
      is_admin: true,
    },
    app_metadata: {
      ...(authUser.app_metadata ?? {}),
      is_admin: true,
      role: "superadmin",
      tenant_id: tenant.id,
      active: true,
    },
  });
  if (authUpdateErr) {
    await cleanupProvision(supabase, {
      tenantId: tenant.id,
      authUserId: authUser.id,
      deleteAuthUser: createdAuthUser,
    });
    return { ok: false, error: `No se pudieron actualizar claims: ${authUpdateErr.message}` };
  }

  return { ok: true, tenantId: tenant.id, userId: authUser.id, slug };
}

// Fully removes a tenant. The tenants row cascades to tenant_id-scoped tables.
// Auth users are deleted after the database rows are gone.
export async function deleteTenantCascade(tenantId: number): Promise<void> {
  const supabase = createServiceClient();

  const { data: members } = await supabase
    .from("admins")
    .select("user_id, role")
    .eq("tenant_id", tenantId);

  await supabase.from("tenants").delete().eq("id", tenantId);

  for (const m of members ?? []) {
    if (m.user_id && m.role !== "developer") {
      try {
        await supabase.auth.admin.deleteUser(m.user_id);
      } catch {
        // ignore; auth user may already be gone
      }
    }
  }
}
