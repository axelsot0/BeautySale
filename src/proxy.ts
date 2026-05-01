import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const MAINTENANCE_PATH = "/maintenance";
const ADMIN_LOGIN_PATH = "/admin/login";

// Paths that bypass the platform-active gate.
const BYPASS_PREFIXES = ["/admin", "/api/super", "/api/auth", MAINTENANCE_PATH];

// Files that should never go through middleware logic.
const STATIC_PREFIXES = ["/_next/", "/favicon.ico", "/fonts/", "/images/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const { response, supabase, user } = await updateSession(request);

  // Admin auth gate: redirect unauthenticated users hitting /admin (except /admin/login).
  if (pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN_PATH && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Platform-active gate (super-admin controlled).
  if (!BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    const { data } = await supabase
      .from("platform_settings")
      .select("active")
      .eq("id", 1)
      .single();

    if (data && data.active === false) {
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
