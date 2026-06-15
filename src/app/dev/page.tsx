import { createServiceClient } from "@/lib/supabase/service";
import { setTenantActive, setPlan, deleteTenant, enterStore, resolveSubscriptionRequest } from "./actions";
import { CreateSuperAdminForm } from "./CreateSuperAdminForm";
import { PLAN_PRICES, PLAN_LABELS, type Plan } from "@/lib/plans";
import { Store, ExternalLink, LogIn, Rocket, Trash2, MessageCircle, Check, X } from "lucide-react";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function demoDaysLeft(expires: string | null): number | null {
  if (!expires) return null;
  return Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / DAY_MS));
}

export default async function DevPage() {
  const supabase = createServiceClient();

  const [{ data: tenants }, { data: members }, { data: requests }] = await Promise.all([
    supabase
      .from("tenants")
      .select("id, slug, name, active, owner_id, is_demo, demo_expires_at, plan, plan_expires_at")
      .order("id", { ascending: true }),
    supabase.from("admins").select("email, role, tenant_id"),
    supabase
      .from("subscription_requests")
      .select("id, tenant_id, plan, months, amount, currency, email, store_name, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const tenantById = new Map<number, { name: string; slug: string }>();
  for (const t of tenants ?? []) tenantById.set(t.id, { name: t.name, slug: t.slug });

  const ownerByTenant = new Map<number, string>();
  const countByTenant = new Map<number, number>();
  for (const m of members ?? []) {
    if (m.tenant_id == null) continue;
    countByTenant.set(m.tenant_id, (countByTenant.get(m.tenant_id) ?? 0) + 1);
    if (m.role === "superadmin") ownerByTenant.set(m.tenant_id, m.email);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl">Tiendas</h1>
        <p className="text-cream/60 mt-1">{tenants?.length ?? 0} en la plataforma</p>
      </header>

      <div className="space-y-3">
        {(tenants ?? []).map((t) => {
          const isDemo = t.is_demo === true;
          const daysLeft = isDemo ? demoDaysLeft(t.demo_expires_at as string | null) : null;
          const expired = isDemo && daysLeft === 0;
          return (
            <div
              key={t.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-cream/5 border border-cream/10 px-5 py-4"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-pink/20 shrink-0">
                <Store className="h-5 w-5 text-pink" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{t.name}</p>
                  {isDemo ? (
                    <span className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 ${
                      expired ? "bg-pink/30 text-pink" : "bg-butter/20 text-butter"
                    }`}>
                      {expired ? "demo vencida" : `demo · ${daysLeft}d`}
                    </span>
                  ) : (
                    <>
                      <span className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 ${
                        t.plan === "pro" ? "bg-lavender/30 text-lavender" : "bg-mint/20 text-mint"
                      }`}>
                        {t.plan ?? "basic"}
                        {t.plan_expires_at &&
                          ` · ${demoDaysLeft(t.plan_expires_at as string)}d`}
                      </span>
                      {!t.active && (
                        <span className="text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 bg-cream/10 text-cream/50">
                          inactiva
                        </span>
                      )}
                    </>
                  )}
                </div>
                <p className="text-sm text-cream/60 truncate">
                  /{t.slug} · {ownerByTenant.get(t.id) ?? "sin dueño"} · {countByTenant.get(t.id) ?? 0} usuarios
                </p>
              </div>

              {/* Enter admin */}
              <form action={enterStore}>
                <input type="hidden" name="id" value={t.id} />
                <button className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-3 py-2 text-xs font-semibold hover:bg-pink hover:text-cream transition">
                  <LogIn className="h-3.5 w-3.5" />
                  Entrar
                </button>
              </form>

              {/* View storefront */}
              <a
                href={`/t/${t.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cream/70 hover:text-pink"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                ver
              </a>

              {/* Assign / renew plan (demo -> official, or change plan) */}
              <form action={setPlan} className="flex items-center gap-1.5">
                <input type="hidden" name="id" value={t.id} />
                <select
                  name="plan"
                  defaultValue={t.plan === "pro" ? "pro" : "basic"}
                  className="rounded-full bg-cream/10 border border-cream/15 px-2.5 py-2 text-xs text-cream outline-none"
                >
                  <option value="basic" className="text-plum">Basic ${PLAN_PRICES.basic}</option>
                  <option value="pro" className="text-plum">Pro ${PLAN_PRICES.pro}</option>
                </select>
                <input
                  name="months"
                  type="number"
                  min={1}
                  max={24}
                  defaultValue={1}
                  title="Meses"
                  className="w-14 rounded-full bg-cream/10 border border-cream/15 px-2.5 py-2 text-xs text-cream outline-none"
                />
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="$"
                  title="Monto cobrado (USD)"
                  className="w-16 rounded-full bg-cream/10 border border-cream/15 px-2.5 py-2 text-xs text-cream outline-none"
                />
                <button className="inline-flex items-center gap-1.5 rounded-full bg-mint text-plum px-3 py-2 text-xs font-semibold hover:opacity-90 transition">
                  <Rocket className="h-3.5 w-3.5" />
                  {isDemo ? "Activar" : "Renovar"}
                </button>
              </form>

              {/* Activate / deactivate (official stores) */}
              {!isDemo && (
                <form action={setTenantActive}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="active" value={(!t.active).toString()} />
                  <button
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      t.active
                        ? "bg-cream/10 hover:bg-pink hover:text-cream"
                        : "bg-mint text-plum hover:opacity-90"
                    }`}
                  >
                    {t.active ? "Desactivar" : "Activar"}
                  </button>
                </form>
              )}

              {/* Delete demo stores */}
              {isDemo && (
                <form action={deleteTenant}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    aria-label="Eliminar tienda demo"
                    className="grid h-9 w-9 place-items-center rounded-full text-cream/50 hover:bg-pink/20 hover:text-pink transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {(requests?.length ?? 0) > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-mint" />
            Solicitudes por transferencia
            <span className="text-sm font-normal text-cream/50">({requests!.length} pendientes)</span>
          </h2>
          {requests!.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-cream/5 border border-cream/10 px-5 py-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{r.store_name}</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 bg-lavender/30 text-lavender">
                    {PLAN_LABELS[r.plan as Plan] ?? r.plan} · {r.months}m
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 bg-mint/20 text-mint">
                    ${Number(r.amount).toFixed(2)} {r.currency}
                  </span>
                </div>
                <p className="text-sm text-cream/60 truncate">
                  {r.email} ·{" "}
                  {r.tenant_id
                    ? tenantById.has(r.tenant_id)
                      ? `${tenantById.get(r.tenant_id)!.name} (/${tenantById.get(r.tenant_id)!.slug})`
                      : `tienda #${r.tenant_id}`
                    : "nuevo (sin cuenta)"}{" "}
                  · {new Date(r.created_at as string).toLocaleDateString("es")}
                </p>
              </div>
              <form action={resolveSubscriptionRequest}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="status" value="approved" />
                <button className="inline-flex items-center gap-1.5 rounded-full bg-mint text-plum px-3 py-2 text-xs font-semibold hover:opacity-90 transition">
                  <Check className="h-3.5 w-3.5" /> Aprobada
                </button>
              </form>
              <form action={resolveSubscriptionRequest}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="status" value="rejected" />
                <button
                  aria-label="Rechazar solicitud"
                  className="grid h-9 w-9 place-items-center rounded-full text-cream/50 hover:bg-pink/20 hover:text-pink transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
          <p className="text-xs text-cream/50">
            Aprobar solo marca la solicitud. Activá la tienda con el botón Activar/Renovar de arriba.
          </p>
        </section>
      )}

      <section className="rounded-2xl bg-cream/5 border border-cream/10 p-6">
        <h2 className="font-display text-2xl mb-1">Nueva tienda</h2>
        <p className="text-cream/60 text-sm mb-5">
          Crea un superAdmin con su tienda (oficial, sin modo demo). Podrá entrar a /admin y
          gestionar su catálogo.
        </p>
        <CreateSuperAdminForm />
      </section>
    </div>
  );
}
