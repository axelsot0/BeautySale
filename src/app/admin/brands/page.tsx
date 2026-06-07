import { Pencil, Plus } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { brandClass } from "@/lib/brand-styles";
import { DeleteButton } from "../_components/DeleteButton";
import { deleteBrand, toggleBrandActive } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();
  const { data: items } = await supabase
    .from("brands")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("position", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pink">marcas</p>
          <h1 className="font-display text-4xl mt-1">Marcas</h1>
          <p className="text-plum-soft mt-1">
            Aparecen en el marquee de marcas. Sin marcas cargadas se muestran ejemplos (modo demo).
          </p>
        </div>
        <a
          href="/admin/brands/new"
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-3 font-semibold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
        >
          <Plus className="h-4 w-4" />
          Nueva marca
        </a>
      </header>

      <div className="rounded-[24px] bg-white border border-plum/5 overflow-hidden">
        {items && items.length > 0 ? (
          <ul className="divide-y divide-plum/5">
            {items.map((b) => (
              <li key={b.id} className="px-5 py-4 flex items-center gap-4">
                <form action={toggleBrandActive}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    title={b.active ? "Desactivar" : "Activar"}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      b.active ? "bg-mint text-plum" : "bg-plum/10 text-plum/60"
                    }`}
                  >
                    {b.active ? "Activa" : "Off"}
                  </button>
                </form>
                <div className="flex-1 min-w-0">
                  {b.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logo_url} alt={b.name} className="h-8 w-auto object-contain" />
                  ) : (
                    <span className={`text-2xl text-plum ${brandClass(b.font_style)}`}>{b.name}</span>
                  )}
                </div>
                <span className="text-xs text-plum-soft hidden md:block">pos {b.position}</span>
                <a
                  href={`/admin/brands/${b.id}`}
                  aria-label="Editar"
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5"
                >
                  <Pencil className="h-4 w-4" />
                </a>
                <DeleteButton action={deleteBrand} id={b.id} label={b.name} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center text-plum-soft">
            Sin marcas todavía. Creá la primera o dejá el modo demo activo para mostrar ejemplos.
          </div>
        )}
      </div>
    </div>
  );
}
