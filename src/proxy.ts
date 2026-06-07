import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const MAINTENANCE_PATH = "/maintenance";
const ADMIN_LOGIN_PATH = "/admin/login";

// Paths that bypass the platform-active gate.
const BYPASS_PREFIXES = ["/admin", "/dev", "/api/super", "/api/auth", MAINTENANCE_PATH];

// In-memory cache for platform_settings (per server instance).
// TTL keeps maintenance toggles responsive within ~30s.
let platformCache: { active: boolean; expires: number } | null = null;
const PLATFORM_TTL_MS = 30_000;

// Files that should never go through proxy logic.
const STATIC_PREFIXES = ["/_next/", "/favicon.ico", "/fonts/", "/images/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const { response, supabase, user } = await updateSession(request);

  const appMeta = (user?.app_metadata ?? {}) as { role?: string; active?: boolean };

  // Developer gate: /dev is for the platform owner only.
  if (pathname.startsWith("/dev")) {
    if (appMeta.role !== "developer") {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Admin gate: read is_admin from JWT user_metadata — no DB call on hot path.
  // DB is the source of truth, but layouts/server actions re-verify via getAdminUser().
  if (pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN_PATH) {
    const isAdmin = !!user?.user_metadata?.is_admin;
    // Block deactivated accounts (claim absent on legacy sessions => not blocked).
    if (!isAdmin || appMeta.active === false) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Platform-active gate (super-admin controlled). Cached 30s to avoid DB hit per request.
  if (!BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    let active = true;
    if (platformCache && platformCache.expires > Date.now()) {
      active = platformCache.active;
    } else {
      const { data } = await supabase
        .from("platform_settings")
        .select("active")
        .eq("id", 1)
        .single();
      active = data?.active !== false;
      platformCache = { active, expires: Date.now() + PLATFORM_TTL_MS };
    }

    if (!active) {
      const url = request.nextUrl.clone();
      url.pathname = MAINTENANCE_PATH;
      return NextResponse.rewrite(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
