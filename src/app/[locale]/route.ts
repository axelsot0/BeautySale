import { NextRequest, NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";

// /es /en /fr /ht — setea la cookie de idioma y vuelve a la página anterior.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return new NextResponse(null, { status: 404 });
  }

  const origin = req.nextUrl.origin;
  const referer = req.headers.get("referer");
  let back = `${origin}/store`;
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.origin === origin) back = referer;
    } catch {
      // referer inválido: fallback a /store
    }
  }

  const res = NextResponse.redirect(back);
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
