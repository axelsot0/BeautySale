import { getActiveTheme } from "@/lib/data/theme-query";
import { Header } from "./Header";

// Server wrapper: resolves the active logo once, then renders the client Header.
export async function SiteHeader() {
  const { logoUrl, siteName } = await getActiveTheme();
  return <Header logoUrl={logoUrl} siteName={siteName} />;
}
