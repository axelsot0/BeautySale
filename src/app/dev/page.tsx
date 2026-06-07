import { createServiceClient } from "@/lib/supabase/service";
import { setTenantActive } from "./actions";
import { CreateSuperAdminForm } from "./CreateSuperAdminForm";
import { Store, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DevPage() {
  const supabase = createServiceClient();

  const [{ data: tenants }, { data: members }] = await Promise.all([
    supabase.from("tenants").select("id, slug, name, active, owner_id").order("id", { ascending: true }),
    supabase.from("admins").select("email, role, tenant_id"),
  ]);

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
        {(tenants ?? []).map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl bg-cream/5 border border-cream/10 px-5 py-4"
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-pink/20 shrink-0">
              <Store className="h-5 w-5 text-pink" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{t.name}</p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 ${
                    t.active ? "bg-mint/20 text-mint" : "bg-cream/10 text-cream/50"
                  }`}
                >
                  {t.active ? "activa" : "inactiva"}
                </span>
              </div>
              <p className="text-sm text-cream/60 truncate">
                /{t.slug} · {ownerByTenant.get(t.id) ?? "sin dueño"} · {countByTenant.get(t.id) ?? 0} usuarios
              </p>
            </div>

            <a
              href={`/t/${t.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cream/70 hover:text-pink"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              ver
            </a>

            <form action={setTenantActive}>
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="active" value={(!t.active).toString()} />
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  t.active
                    ? "bg-cream/10 hover:bg-pink hover:text-cream"
                    : "bg-mint text-plum hover:opacity-90"
                }`}
              >
                {t.active ? "Desactivar" : "Activar"}
              </button>
            </form>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-cream/5 border border-cream/10 p-6">
        <h2 className="font-display text-2xl mb-1">Nueva tienda</h2>
        <p className="text-cream/60 text-sm mb-5">
          Crea un superAdmin con su tienda. Podrá entrar a /admin y gestionar su catálogo.
        </p>
        <CreateSuperAdminForm />
      </section>
    </div>
  );
}
