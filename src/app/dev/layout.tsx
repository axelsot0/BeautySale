import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminUser } from "@/lib/auth";
import { logout } from "@/app/admin/login/actions";
import { Code2, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DevLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user?.email) redirect("/admin/login?next=/dev");

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("admins")
    .select("role")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  if (!data || data.role !== "developer") redirect("/admin");

  return (
    <div className="min-h-screen bg-plum text-cream">
      <header className="flex items-center justify-between px-5 py-4 border-b border-cream/10">
        <div className="flex items-center gap-2 font-display text-xl">
          <Code2 className="h-5 w-5 text-pink" />
          Developer
          <span className="text-[10px] font-bold uppercase tracking-widest bg-pink text-cream rounded-full px-2 py-0.5 ml-1">
            plataforma
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-cream/60 hidden sm:block">{user.email}</span>
          <form action={logout}>
            <button className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-2 font-semibold hover:bg-pink transition">
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="p-5 md:p-8 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
