import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { CategoryForm } from "../CategoryForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("categories").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">categorías</p>
        <h1 className="font-display text-4xl mt-1">Editar: {data.name}</h1>
      </header>
      <CategoryForm category={data} />
    </div>
  );
}
