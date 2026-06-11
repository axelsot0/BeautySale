import { cookies } from "next/headers";
import { getActiveTheme } from "@/lib/data/theme-query";
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { TENANT_COOKIE } from "@/lib/tenant-cookie";
import { Header } from "./Header";

export async function SiteHeader() {
  const t = await getStorefrontTenantId();
  const { logoUrl, siteName, navLinks } = await getActiveTheme(t);
  const cookieStore = await cookies();
  const tenantSlug = cookieStore.get(TENANT_COOKIE)?.value;
  const homeHref = tenantSlug ? `/t/${tenantSlug}` : "/";
  return <Header logoUrl={logoUrl} siteName={siteName} navLinks={navLinks} homeHref={homeHref} />;
}
