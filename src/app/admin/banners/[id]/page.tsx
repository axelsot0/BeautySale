import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { BannerForm } from "../BannerForm";

export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("banners").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">visual</p>
        <h1 className="font-display text-4xl mt-1">Editar banner</h1>
        <p className="text-plum-soft mt-1">{data.title}</p>
      </header>
      <BannerForm banner={data} />
    </div>
  );
}
