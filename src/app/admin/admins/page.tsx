import { Plus, Trash2, Crown } from "lucide-react";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { getAdminMembership, getAdminTenantId, canManageAdmins } from "@/lib/tenant-context";
import { deleteAdmin } from "./actions";
import { ResetPasswordButton } from "./ResetPasswordButton";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const me = await getAdminUser();
  const membership = await getAdminMembership();
  if (!membership || !canManageAdmins(membership.role)) redirect("/admin");

  const isDev = membership.role === "developer";
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();

  // Scope to the tenant in view (developer can switch stores). The platform
  // owner's own row and other developers are never listed/managed.
  const { data: admins } = await supabase
    .from("admins")
    .select("*")
    .eq("tenant_id", tenantId)
    .neq("role", "developer")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pink">seguridad</p>
          <h1 className="font-display text-4xl mt-1">Administradores</h1>
          <p className="text-plum-soft mt-1">{admins?.length ?? 0} con acceso a esta tienda</p>
        </div>
        <a
          href="/admin/admins/new"
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-3 font-semibold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo admin
        </a>
      </header>

      <div className="rounded-[24px] bg-white border border-plum/5">
        {admins && admins.length > 0 ? (
          <ul className="divide-y divide-plum/5">
            {admins.map((a) => {
              const isMe = a.user_id === me?.id;
              const isOwner = a.role === "superadmin";
              // Owner row is protected from non-developers.
              const canManage = !isMe && (isDev || !isOwner);
              return (
                <li key={a.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{a.full_name ?? "—"}</p>
                      {isOwner && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-butter text-plum rounded-full px-2 py-0.5">
                          <Crown className="h-3 w-3" /> dueño
                        </span>
                      )}
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

                  {canManage && <ResetPasswordButton id={a.id} email={a.email} />}

                  {canManage && (
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
            Sin admins en esta tienda. Creá el primero.
          </div>
        )}
      </div>
    </div>
  );
}
