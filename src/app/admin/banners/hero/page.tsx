import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { HeroForm } from "../HeroForm";

export const dynamic = "force-dynamic";

function Tabs({ active }: { active: "hero" | "banners" }) {
  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-plum/5 w-fit">
      <a
        href="/admin/banners/hero"
        className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
          active === "hero" ? "bg-white shadow text-plum" : "text-plum/60 hover:text-plum"
        }`}
      >
        Hero
      </a>
      <a
        href="/admin/banners"
        className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
          active === "banners" ? "bg-white shadow text-plum" : "text-plum/60 hover:text-plum"
        }`}
      >
        Banners
      </a>
    </div>
  );
}

export default async function AdminHeroPage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();
  const [{ data: hero }, { data: categories }] = await Promise.all([
    supabase
      .from("banners")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("slot", "hero")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("slug, name")
      .eq("tenant_id", tenantId)
      .order("position"),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">visual</p>
        <h1 className="font-display text-4xl mt-1">Banners</h1>
      </header>

      <Tabs active="hero" />

      <div>
        <p className="text-sm text-plum-soft mb-4">
          El hero es el banner principal de la portada. Solo puede haber uno.
          {!hero && " Todavía no hay hero configurado."}
        </p>
        <HeroForm hero={hero ?? undefined} categories={categories ?? []} />
      </div>
    </div>
  );
}
