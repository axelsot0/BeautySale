import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { getTenantStatus } from "@/lib/demo-server";
import { PLAN_PRICES, PLAN_LABELS, PLAN_PERKS, type Plan } from "@/lib/plans";
import { Crown, Check, CalendarClock, Receipt, Sparkle, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; error?: string; cancelled?: string }>;
}) {
  const { paid, error, cancelled } = await searchParams;
  const tenantId = await getAdminTenantId();
  const status = await getTenantStatus(tenantId);

  const supabase = createServiceClient();
  const { data: payments } = await supabase
    .from("subscription_payments")
    .select("id, plan, months, amount, currency, method, paid_at")
    .eq("tenant_id", tenantId)
    .order("paid_at", { ascending: false })
    .limit(24);

  const plan = status.plan;
  const expiresAt = status.isDemo ? status.demoExpiresAt : status.planExpiresAt;
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / DAY_MS))
    : null;

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">cuenta</p>
        <h1 className="font-display text-4xl mt-1">Suscripción</h1>
      </header>

      {paid && (
        <div className="flex items-center gap-2 rounded-2xl bg-mint/15 border border-mint/30 px-5 py-4 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 text-mint shrink-0" />
          Pago recibido. Tu plan fue actualizado.
        </div>
      )}
      {(error || cancelled) && (
        <div className="flex items-center gap-2 rounded-2xl bg-pink/10 border border-pink/20 px-5 py-4 text-sm font-medium text-pink">
          <XCircle className="h-5 w-5 shrink-0" />
          {cancelled ? "Pago cancelado." : "No pudimos procesar el pago. Intentá de nuevo."}
        </div>
      )}

      {/* Estado actual */}
      <section className="rounded-[28px] bg-plum text-cream p-7 md:p-9">
        <div className="flex flex-wrap items-center gap-6 justify-between">
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream/60">
              <Crown className="h-4 w-4 text-butter" /> Plan actual
            </p>
            <p className="font-display text-4xl">
              {PLAN_LABELS[plan]}
              {plan !== "demo" && (
                <span className="text-lg text-cream/60 ml-2">
                  ${PLAN_PRICES[plan as Exclude<Plan, "demo">]}/mes
                </span>
              )}
            </p>
          </div>
          <div className="space-y-1.5 text-right">
            <p className="flex items-center gap-2 justify-end text-xs font-bold uppercase tracking-widest text-cream/60">
              <CalendarClock className="h-4 w-4" /> {status.isDemo ? "Tu demo expira" : "Vence"}
            </p>
            <p className="font-display text-2xl">{fmtDate(expiresAt)}</p>
            {daysLeft != null && (
              <p className={`text-sm ${daysLeft <= 7 ? "text-butter" : "text-cream/60"}`}>
                {daysLeft === 0 ? "Vence hoy" : `${daysLeft} ${daysLeft === 1 ? "día" : "días"} restantes`}
              </p>
            )}
          </div>
        </div>
        {(status.isDemo || (daysLeft != null && daysLeft <= 7)) && (
          <div className="mt-6 rounded-2xl bg-butter/15 border border-butter/30 px-5 py-4 text-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-butter flex items-center gap-1.5">
                <Sparkle className="h-4 w-4" />
                {status.isDemo ? "Activá tu tienda" : "Renová tu plan"}
              </p>
              <p className="text-cream/80 mt-1">
                Pagá con PayPal, tarjeta o transferencia por WhatsApp.
              </p>
            </div>
            <a
              href={`/suscribir?plan=${plan === "pro" ? "pro" : "basic"}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-pink px-5 py-2.5 text-sm font-bold text-cream hover:opacity-90 transition shrink-0"
            >
              {status.isDemo ? "Activar ahora" : "Renovar ahora"}
            </a>
          </div>
        )}
      </section>

      {/* Comparativa de planes */}
      <section>
        <h2 className="font-display text-2xl mb-4">Planes</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {(Object.keys(PLAN_PERKS) as Plan[]).map((p) => {
            const isCurrent = p === plan;
            return (
              <div
                key={p}
                className={`rounded-[24px] p-6 space-y-4 border ${
                  isCurrent ? "bg-pink/5 border-pink" : "bg-white border-plum/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl">{PLAN_LABELS[p]}</h3>
                  {isCurrent && (
                    <span className="rounded-full bg-pink text-cream px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      Actual
                    </span>
                  )}
                </div>
                <p className="font-display text-3xl">
                  {p === "demo" ? "Gratis" : `$${PLAN_PRICES[p as Exclude<Plan, "demo">]}`}
                  {p !== "demo" && <span className="text-sm text-plum-soft font-sans"> /mes</span>}
                </p>
                <ul className="space-y-1.5 text-sm">
                  {PLAN_PERKS[p].map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-pink shrink-0" /> {perk}
                    </li>
                  ))}
                </ul>
                {p !== "demo" && (
                  <a
                    href={`/suscribir?plan=${p}`}
                    className={`block text-center rounded-full px-5 py-2.5 text-sm font-bold transition ${
                      isCurrent
                        ? "bg-plum/5 text-plum hover:bg-plum hover:text-cream"
                        : "bg-pink text-cream hover:opacity-90"
                    }`}
                  >
                    {isCurrent ? "Renovar" : "Comprar"}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Historial de pagos */}
      <section>
        <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-pink" /> Historial de pagos
        </h2>
        {!payments?.length ? (
          <p className="text-plum-soft text-sm rounded-2xl bg-white border border-plum/10 px-5 py-6 text-center">
            Sin pagos registrados todavía.
          </p>
        ) : (
          <div className="rounded-2xl bg-white border border-plum/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-plum-soft border-b border-plum/10">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Meses</th>
                  <th className="px-5 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-plum/5 last:border-0">
                    <td className="px-5 py-3">{fmtDate(p.paid_at)}</td>
                    <td className="px-5 py-3 font-semibold">{PLAN_LABELS[p.plan as Plan] ?? p.plan}</td>
                    <td className="px-5 py-3">{p.months}</td>
                    <td className="px-5 py-3 text-right font-mono">
                      ${Number(p.amount).toFixed(2)} {p.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
