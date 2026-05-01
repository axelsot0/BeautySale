import { Plus, Trash2, Key } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { deleteAdmin, resetAdminPassword } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const me = await getAdminUser();
  const supabase = createServiceClient();
  const { data: admins } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pink">seguridad</p>
          <h1 className="font-display text-4xl mt-1">Administradores</h1>
          <p className="text-plum-soft mt-1">{admins?.length ?? 0} con acceso al panel</p>
        </div>
        <a
          href="/admin/admins/new"
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-3 font-semibold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo admin
        </a>
      </header>

      <div className="rounded-[24px] bg-white border border-plum/5 overflow-hidden">
        {admins && admins.length > 0 ? (
          <ul className="divide-y divide-plum/5">
            {admins.map((a) => {
              const isMe = a.user_id === me?.id;
              return (
                <li key={a.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{a.full_name ?? "—"}</p>
                      {isMe && (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-pink text-cream rounded-full px-2 py-0.5">
                          tú
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-plum-soft">{a.email}</p>
                  </div>

                  <span className="text-xs text-plum-soft hidden md:block">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>

                  {/* Reset password popover */}
                  <details className="relative">
                    <summary className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5 cursor-pointer list-none">
                      <Key className="h-4 w-4" />
                    </summary>
                    <form
                      action={resetAdminPassword}
                      className="absolute right-0 top-10 z-10 w-72 rounded-2xl border border-plum/10 bg-white p-4 shadow-lg space-y-2"
                    >
                      <input type="hidden" name="id" value={a.id} />
                      <p className="text-xs font-bold uppercase tracking-wider text-plum-soft">
                        Nueva password para {a.email}
                      </p>
                      <input
                        type="password"
                        name="password"
                        minLength={6}
                        required
                        placeholder="Mínimo 6 caracteres"
                        className="w-full rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-full bg-plum text-cream py-2 text-sm font-semibold hover:bg-pink transition"
                      >
                        Resetear
                      </button>
                    </form>
                  </details>

                  {!isMe && (
                    <form action={deleteAdmin}>
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        title="Eliminar"
                        className="grid h-9 w-9 place-items-center rounded-full hover:bg-pink/10 hover:text-pink transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-10 text-center text-plum-soft">
            Sin admins en DB. Creá el primero.
          </div>
        )}
      </div>
    </div>
  );
}
