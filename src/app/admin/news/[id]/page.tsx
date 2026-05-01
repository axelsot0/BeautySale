import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { NewsForm } from "../NewsForm";

export const dynamic = "force-dynamic";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("news").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">news</p>
        <h1 className="font-display text-4xl mt-1">Editar mensaje</h1>
      </header>
      <NewsForm news={data} />
    </div>
  );
}
