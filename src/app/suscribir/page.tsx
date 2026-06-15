import { Check, Crown, ArrowLeft } from "lucide-react";
import { getAdminUser } from "@/lib/auth";
import { getAdminMembership, getAdminTenantId } from "@/lib/tenant-context";
import { getTenantStatus } from "@/lib/demo-server";
import { createServiceClient } from "@/lib/supabase/service";
import { getPlatformPayPalCreds } from "@/lib/platform-paypal";
import { PLAN_PRICES, PLAN_LABELS, PLAN_PERKS, type Plan } from "@/lib/plans";
import { SubscribeCheckout } from "./SubscribeCheckout";

export const dynamic = "force-dynamic";

export const metadata = { title: "Suscribirme — BeautySale" };

function asPlan(v: string | undefined): "basic" | "pro" {
  return v === "basic" ? "basic" : "pro";
}

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; months?: string }>;
}) {
  const { plan: planParam, months: monthsParam } = await searchParams;
  const plan = asPlan(planParam);
  const months = Math.max(1, Math.min(24, Number(monthsParam) || 1));

  const paymentsEnabled = getPlatformPayPalCreds() !== null;

  // Sesión: si el admin está logueado, prellenamos email + tienda y bloqueamos.
  const user = await getAdminUser();
  const membership = user ? await getAdminMembership() : null;
  let email = "";
  let storeName = "";
  let currentPlan: Plan = "demo";
  let planActive = false;
  let hasPending = false;
  if (membership) {
    email = user?.email ?? "";
    const tenantId = await getAdminTenantId();
    const supabase = createServiceClient();
    const [{ data: tenant }, status, { data: pending }] = await Promise.all([
      supabase.from("tenants").select("name, site_name").eq("id", tenantId).maybeSingle(),
      getTenantStatus(tenantId),
      supabase
        .from("subscription_requests")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("status", "pending")
        .limit(1)
        .maybeSingle(),
    ]);
    storeName = tenant?.name ?? tenant?.site_name ?? "";
    currentPlan = status.plan;
    // Plan pago vigente: no demo y sin vencer (o sin fecha de vencimiento).
    planActive =
      !status.isDemo &&
      status.plan !== "demo" &&
      (status.planExpiresAt == null || new Date(status.planExpiresAt).getTime() > Date.now());
    hasPending = !!pending;
  }

  return (
    <div className="min-h-screen bg-cream text-plum">
      <header className="border-b border-plum/10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <a href="/" className="font-display text-2xl">
            Beauty<span className="text-pink italic">Sale</span>
          </a>
          <a
            href={membership ? "/admin/subscription" : "/"}
            className="inline-flex items-center gap-1.5 text-sm text-plum-soft hover:text-pink transition"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14 grid lg:grid-cols-[1fr_1.1fr] gap-8">
        {/* Plan elegido + beneficios */}
        <section className="space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-pink">checkout</p>
            <h1 className="font-display text-4xl mt-1">Activá tu plan</h1>
            <p className="text-plum-soft mt-2">
              Elegí cómo pagar. Tu tienda se activa al confirmar el pago.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {(["basic", "pro"] as const).map((p) => {
              const active = p === plan;
              return (
                <a
                  key={p}
                  href={`/suscribir?plan=${p}&months=${months}`}
                  className={`rounded-[22px] p-5 border transition ${
                    active
                      ? "bg-plum text-cream border-plum shadow-[0_16px_40px_rgba(45,27,78,0.18)]"
                      : "bg-white border-plum/10 hover:border-plum/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl flex items-center gap-1.5">
                      {p === "pro" && <Crown className="h-4 w-4 text-butter" />}
                      {PLAN_LABELS[p]}
                    </h2>
                    {active && (
                      <span className="rounded-full bg-pink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                        Elegido
                      </span>
                    )}
                  </div>
                  <p className="font-display text-3xl mt-2">
                    ${PLAN_PRICES[p]}
                    <span className={`text-sm font-sans ${active ? "text-cream/60" : "text-plum-soft"}`}>
                      {" "}/mes
                    </span>
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {PLAN_PERKS[p].map((perk) => (
                      <li key={perk} className="flex items-center gap-2">
                        <Check className={`h-3.5 w-3.5 shrink-0 ${active ? "text-mint" : "text-pink"}`} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </a>
              );
            })}
          </div>
        </section>

        {/* Formulario + métodos de pago */}
        <SubscribeCheckout
          plan={plan}
          months={months}
          loggedIn={!!membership}
          email={email}
          storeName={storeName}
          paymentsEnabled={paymentsEnabled}
          currentPlan={currentPlan}
          planActive={planActive}
          hasPending={hasPending}
        />
      </div>
    </div>
  );
}
