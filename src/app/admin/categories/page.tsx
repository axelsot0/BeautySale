import { Plus, Pencil } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { DeleteButton } from "../_components/DeleteButton";
import { deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("position", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pink">categorías</p>
          <h1 className="font-display text-4xl mt-1">Gestionar categorías</h1>
        </div>
        <a
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-3 font-semibold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </a>
      </header>

      <div className="rounded-[24px] bg-white border border-plum/5 overflow-hidden">
        {categories && categories.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-left text-xs uppercase tracking-widest text-plum-soft">
              <tr>
                <th className="px-5 py-3 w-16">Color</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3 hidden md:table-cell">Slug</th>
                <th className="px-5 py-3 hidden md:table-cell w-20">Pos.</th>
                <th className="px-5 py-3 w-32 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-plum/5">
                  <td className="px-5 py-3">
                    <div
                      className="h-10 w-10 rounded-2xl grid place-items-center text-lg"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.icon ?? "✨"}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-display text-base">{c.name}</td>
                  <td className="px-5 py-3 hidden md:table-cell text-plum-soft">{c.slug}</td>
                  <td className="px-5 py-3 hidden md:table-cell text-plum-soft">{c.position}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/admin/categories/${c.slug}`}
                        aria-label="Editar"
                        className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </a>
                      <DeleteButton action={deleteCategory} id={c.id} label={c.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center text-plum-soft">
            Todavía no hay categorías. Empezá creando la primera.
          </div>
        )}
      </div>
    </div>
  );
}
