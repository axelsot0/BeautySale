import { Pencil, Plus } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { DeleteButton } from "../_components/DeleteButton";
import { deleteBanner, toggleBannerActive } from "./actions";

export const dynamic = "force-dynamic";

const SLOT_LABELS: Record<string, string> = {
  hero: "Hero",
  mid: "Mid",
  sidebar: "Sidebar",
};

export default async function AdminBannersPage() {
  const supabase = createServiceClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("position", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pink">visual</p>
          <h1 className="font-display text-4xl mt-1">Banners</h1>
          <p className="text-plum-soft mt-1">Imágenes del hero y secciones intermedias.</p>
        </div>
        <a
          href="/admin/banners/new"
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-3 font-semibold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo banner
        </a>
      </header>

      <div className="rounded-[24px] bg-white border border-plum/5 overflow-hidden">
        {banners && banners.length > 0 ? (
          <ul className="divide-y divide-plum/5">
            {banners.map((b) => (
              <li key={b.id} className="px-5 py-4 flex items-center gap-4">
                {/* Thumb */}
                <div className="h-14 w-24 rounded-xl overflow-hidden shrink-0 bg-plum/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image_url} alt={b.title} className="h-full w-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{b.title}</p>
                  {b.subtitle && (
                    <p className="text-xs text-plum-soft line-clamp-1">{b.subtitle}</p>
                  )}
                </div>

                {/* Slot badge */}
                <span className="hidden md:block text-xs font-bold uppercase tracking-wider bg-lavender/20 text-plum rounded-full px-3 py-1">
                  {SLOT_LABELS[b.slot] ?? b.slot}
                </span>

                {/* pos */}
                <span className="text-xs text-plum-soft hidden md:block">pos {b.position}</span>

                {/* Active toggle */}
                <form action={toggleBannerActive}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="current" value={String(b.active)} />
                  <button
                    type="submit"
                    title={b.active ? "Desactivar" : "Activar"}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      b.active ? "bg-mint text-plum" : "bg-plum/10 text-plum/60"
                    }`}
                  >
                    {b.active ? "Activo" : "Off"}
                  </button>
                </form>

                {/* Edit */}
                <a
                  href={`/admin/banners/${b.id}`}
                  aria-label="Editar"
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5"
                >
                  <Pencil className="h-4 w-4" />
                </a>

                <DeleteButton action={deleteBanner} id={b.id} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center text-plum-soft">
            Sin banners todavía.{" "}
            <a href="/admin/banners/new" className="text-pink font-semibold hover:underline">
              Creá el primero
            </a>
            .
          </div>
        )}
      </div>
    </div>
  );
}
