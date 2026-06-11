import { Lock } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminMembership, getAdminTenantId } from "@/lib/tenant-context";
import { getTenantStatus } from "@/lib/demo-server";
import { parseSocialLinks } from "@/lib/social";
import { DEFAULT_SITE_NAME } from "@/lib/theme";
import { getActiveTheme, getFooterConfig, getNewsletterConfig } from "@/lib/data/theme-query";
import { PayPalForm } from "./PayPalForm";
import { SiteSettingsForm } from "./SiteSettingsForm";
import { NavLinksForm } from "./NavLinksForm";
import { FooterSettingsForm } from "./FooterSettingsForm";
import { NewsletterSettingsForm } from "./NewsletterSettingsForm";
import { WhatsAppCheckoutForm } from "./WhatsAppCheckoutForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();

  const [{ data }, theme, footer, newsletter] = await Promise.all([
    supabase
      .from("tenants")
      .select("paypal_client_id, paypal_secret, paypal_mode, site_name, social_links, whatsapp_checkout")
      .eq("id", tenantId)
      .single(),
    getActiveTheme(tenantId),
    getFooterConfig(tenantId),
    getNewsletterConfig(tenantId),
  ]);

  const siteName = (data?.site_name as string | null)?.trim() || DEFAULT_SITE_NAME;
  const social   = parseSocialLinks(data?.social_links);

  const membership = await getAdminMembership();
  const isDeveloper = membership?.role === "developer";
  const status = isDeveloper ? null : await getTenantStatus(tenantId);
  const demo = status?.isDemo ?? false;

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">ajustes</p>
        <h1 className="font-display text-4xl mt-1">Ajustes de tienda</h1>
        <p className="text-plum-soft mt-1">
          Nombre, navegación, footer, newsletter y cobros.
        </p>
      </header>

      {/* Nombre + Redes (disponible en demo) */}
      <SiteSettingsForm siteName={siteName} social={social} />

      {demo ? (
        <DemoLock title="Personalización avanzada y pagos">
          Menú de navegación, footer, newsletter y métodos de pago se desbloquean al activar
          tu tienda.
        </DemoLock>
      ) : (
        <>
          {/* Menú de navegación */}
          <section className="rounded-3xl border border-plum/10 bg-white p-6 space-y-3">
            <h2 className="font-display text-2xl">Menú de navegación</h2>
            <p className="text-sm text-plum-soft">
              Los enlaces del header. ★ = destacado (color accent). Sin cambios = menú por defecto.
            </p>
            <NavLinksForm links={theme.navLinks} />
          </section>

          {/* Footer */}
          <section className="rounded-3xl border border-plum/10 bg-white p-6 space-y-4">
            <h2 className="font-display text-2xl">Footer</h2>
            <p className="text-sm text-plum-soft">
              Descripción, columnas de links y métodos de pago. La columna Categorías se llena
              automáticamente desde las categorías que creaste.
            </p>
            <FooterSettingsForm config={footer} />
          </section>

          {/* Newsletter */}
          <NewsletterSettingsForm config={newsletter} />

          {/* Pagos */}
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-2xl">Pagos</h2>
              <p className="text-plum-soft text-sm mt-1">
                Configura los metodos de cobro disponibles en el checkout.
              </p>
            </div>

            {/* PayPal */}
            <div className="rounded-3xl border border-plum/10 bg-white p-6 space-y-3">
              <h3 className="font-display text-lg">PayPal</h3>
              <p className="text-sm text-plum-soft">
                Conecta tu PayPal Business. Vacio = credenciales del sistema.
              </p>
              <PayPalForm
                clientId={(data?.paypal_client_id as string | null) ?? ""}
                mode={(data?.paypal_mode as string | null) === "live" ? "live" : "sandbox"}
                hasSecret={Boolean(data?.paypal_secret)}
              />
            </div>

            {/* WhatsApp checkout */}
            <div className="rounded-3xl border border-[#25D366]/30 bg-white p-6 space-y-3">
              <h3 className="font-display text-lg flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#25D366]" />
                WhatsApp
              </h3>
              <p className="text-sm text-plum-soft">
                El cliente llena el checkout y envia su pedido por WhatsApp. El pago se
                coordina fuera de la plataforma; vos marcas el pedido como Pagado o Declinado
                desde Admin → Pedidos.
              </p>
              <WhatsAppCheckoutForm
                currentNumber={(data?.whatsapp_checkout as string | null) ?? ""}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function DemoLock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-dashed border-plum/20 bg-white p-6 flex items-start gap-4">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-pink/10 shrink-0">
        <Lock className="h-5 w-5 text-pink" />
      </div>
      <div className="space-y-1">
        <h2 className="font-display text-xl">{title}</h2>
        <p className="text-sm text-plum-soft">{children}</p>
        <p className="text-xs font-semibold text-pink uppercase tracking-widest pt-1">Función premium</p>
      </div>
    </section>
  );
}
