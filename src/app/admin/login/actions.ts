"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { syncAdminClaims } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export type LoginState = { error?: string };

// Generic message used for ALL auth failures — prevents username enumeration.
const AUTH_ERROR = "Credenciales inválidas";

// Rate limiting: 10 attempts per IP per 15-minute window.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

async function checkAndRecordAttempt(ip: string): Promise<boolean> {
  const admin = createServiceClient();
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  // Count attempts in window
  const { count } = await admin
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("attempted_at", windowStart);

  if ((count ?? 0) >= MAX_ATTEMPTS) return false; // blocked

  // Record this attempt (fire-and-forget cleanup of rows > 1h old)
  await admin.from("login_attempts").insert({ ip });
  admin.from("login_attempts").delete().lt("attempted_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()).then(() => {});

  return true; // allowed
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await getClientIp();
  const allowed = await checkAndRecordAttempt(ip);
  if (!allowed) {
    return { error: "Demasiados intentos. Intentá de nuevo en 15 minutos." };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { error: AUTH_ERROR };

  const { email, password, next } = parsed.data;

  // Always attempt signIn first — never reveal whether an email is registered.
  const supabase = await createClient();
  const { data: signin, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !signin.user) return { error: AUTH_ERROR };

  // Verify admin membership from DB (authoritative) and write JWT claims.
  const membership = await syncAdminClaims(signin.user.id, email);
  if (!membership) {
    // Valid Supabase user but not an admin — sign them back out silently.
    await supabase.auth.signOut();
    return { error: AUTH_ERROR };
  }
  if (membership.active === false) {
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
  await supabase.auth.refreshSession();

  redirect(next && next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
