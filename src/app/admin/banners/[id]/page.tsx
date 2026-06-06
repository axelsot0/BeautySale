import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { BannerForm } from "../BannerForm";
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

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("banners").select("*").eq("id", id).single();

  if (!data) notFound();

  const isHero = data.slot === "hero";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">visual</p>
        <h1 className="font-display text-4xl mt-1">
          {isHero ? "Editar hero" : "Editar banner"}
        </h1>
        <p className="text-plum-soft mt-1">{data.title}</p>
      </header>

      <Tabs active={isHero ? "hero" : "banners"} />

      {isHero ? <HeroForm hero={data} /> : <BannerForm banner={data} />}
    </div>
  );
}
