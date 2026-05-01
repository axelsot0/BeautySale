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
