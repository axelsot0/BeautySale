import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { DEFAULT_PALETTE, DEFAULT_SITE_NAME, parsePalette, type Palette } from "@/lib/theme";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

export type ActiveTheme = { palette: Palette; logoUrl: string | null; siteName: string };

// Reads the active theme from the tenant row. Always returns a usable theme:
// on any failure or missing/invalid data, falls back to the built-in palette.
export async function getActiveTheme(
  tenantId: number = DEFAULT_TENANT_ID,
): Promise<ActiveTheme> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("theme, logo_url, site_name")
      .eq("id", tenantId)
      .single();
    if (error || !data) return { palette: DEFAULT_PALETTE, logoUrl: null, siteName: DEFAULT_SITE_NAME };

    const palette = parsePalette(data.theme) ?? DEFAULT_PALETTE;
    const logoUrl = typeof data.logo_url === "string" && data.logo_url ? data.logo_url : null;
    const siteName =
      typeof data.site_name === "string" && data.site_name.trim() ? data.site_name.trim() : DEFAULT_SITE_NAME;
    return { palette, logoUrl, siteName };
  } catch {
    return { palette: DEFAULT_PALETTE, logoUrl: null, siteName: DEFAULT_SITE_NAME };
  }
}
