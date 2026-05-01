import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("message_when_off")
    .eq("id", 1)
    .single();

  const message =
    data?.message_when_off ?? "Estamos haciéndonos lindas. Volvemos pronto.";

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl text-center space-y-6">
        <div className="inline-block rounded-full bg-butter text-plum px-4 py-2 text-sm font-bold -rotate-2">
          ✨ Mantenimiento
        </div>
        <h1 className="font-display text-5xl md:text-7xl">
          Volvemos <span className="text-pink italic">pronto</span>
        </h1>
        <p className="text-lg text-plum-soft">{message}</p>
      </div>
    </main>
  );
}
