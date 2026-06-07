"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdminEmail, syncAdminClaims } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { error: "Email o contraseña inválidos" };

  const { email, password, next } = parsed.data;

  if (!(await isAdminEmail(email))) {
    return { error: "Este email no está autorizado" };
  }

  const supabase = await createClient();
  const { data: signin, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !signin.user) return { error: "Credenciales inválidas" };

  // Authoritative membership -> JWT claims (role, tenant_id, active).
  const membership = await syncAdminClaims(signin.user.id, email);
  if (!membership || membership.active === false) {
    await supabase.auth.signOut();
    return { error: "Tu cuenta está desactivada" };
  }

  // Block login if the admin's store is deactivated (cascade from developer).
  if (membership.tenant_id) {
    const admin = createServiceClient();
    const { data: tenant } = await admin
      .from("tenants")
      .select("active")
      .eq("id", membership.tenant_id)
      .single();
    if (tenant && tenant.active === false) {
      await supabase.auth.signOut();
      return { error: "Tu tienda está desactivada" };
    }
  }

  await supabase.auth.updateUser({ data: { is_admin: true } });
  // Refresh so the new app_metadata claims land in the session JWT.
  await supabase.auth.refreshSession();

  redirect(next && next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
