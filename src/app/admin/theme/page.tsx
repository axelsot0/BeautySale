import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId, getAdminMembership } from "@/lib/tenant-context";
import { parseSocialLinks } from "@/lib/social";
import {
  DEFAULT_PALETTE,
  DEFAULT_SITE_NAME,
  DEFAULT_EDITORIAL_EYEBROW,
  DEFAULT_EDITORIAL_TITLE,
  parsePalette,
} from "@/lib/theme";
import { ThemeEditor } from "./ThemeEditor";

export const dynamic = "force-dynamic";

export default async function AdminThemePage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();
  const { data } = await supabase
    .from("tenants")
    .select("theme, logo_url, site_name, demo_mode, editorial_eyebrow, editorial_title, social_links")
    .eq("id", tenantId)
    .single();

  const current = parsePalette(data?.theme) ?? DEFAULT_PALETTE;
  const isDefault = parsePalette(data?.theme) === null;
  const logoUrl = (data?.logo_url as string | null) ?? null;
  const siteName = (data?.site_name as string | null)?.trim() || DEFAULT_SITE_NAME;
  const demoMode = data?.demo_mode !== false;
  const editorialEyebrow = (data?.editorial_eyebrow as string | null)?.trim() || DEFAULT_EDITORIAL_EYEBROW;
  const editorialTitle = (data?.editorial_title as string | null)?.trim() || DEFAULT_EDITORIAL_TITLE;
  const social = parseSocialLinks(data?.social_links);
  const membership = await getAdminMembership();
  const isDeveloper = membership?.role === "developer";

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">apariencia</p>
        <h1 className="font-display text-4xl mt-1">Tema y marca</h1>
        <p className="text-plum-soft mt-1">
          Personaliza la paleta de colores y el logo. Los cambios son visibles para todos los
          clientes. Si algo falla, se usa la paleta por defecto.
        </p>
      </header>

      <ThemeEditor
        current={current}
        isDefault={isDefault}
        logoUrl={logoUrl}
        siteName={siteName}
        demoMode={demoMode}
        isDeveloper={isDeveloper}
        editorialEyebrow={editorialEyebrow}
        editorialTitle={editorialTitle}
        social={social}
      />
    </div>
  );
}
