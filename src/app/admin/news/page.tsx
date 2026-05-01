import { Pencil, Plus } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { DeleteButton } from "../_components/DeleteButton";
import { deleteNews, toggleNewsActive } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const supabase = createServiceClient();
  const { data: items } = await supabase
    .from("news")
    .select("*")
    .order("position", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pink">news</p>
          <h1 className="font-display text-4xl mt-1">Mensajes barra superior</h1>
          <p className="text-plum-soft mt-1">Aparecen en el marquee del top de la home.</p>
        </div>
        <a
          href="/admin/news/new"
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-3 font-semibold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo mensaje
        </a>
      </header>

      <div className="rounded-[24px] bg-white border border-plum/5 overflow-hidden">
        {items && items.length > 0 ? (
          <ul className="divide-y divide-plum/5">
            {items.map((n) => (
              <li key={n.id} className="px-5 py-4 flex items-center gap-4">
                <form action={toggleNewsActive}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    type="submit"
                    title={n.active ? "Desactivar" : "Activar"}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      n.active ? "bg-mint text-plum" : "bg-plum/10 text-plum/60"
                    }`}
                  >
                    {n.active ? "Activo" : "Off"}
                  </button>
                </form>
                <p className="flex-1 text-sm">{n.text}</p>
                <span className="text-xs text-plum-soft hidden md:block">pos {n.position}</span>
                <a
                  href={`/admin/news/${n.id}`}
                  aria-label="Editar"
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5"
                >
                  <Pencil className="h-4 w-4" />
                </a>
                <DeleteButton action={deleteNews} id={n.id} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center text-plum-soft">
            Sin mensajes todavía. Creá el primero para activar la barra.
          </div>
        )}
      </div>
    </div>
  );
}
