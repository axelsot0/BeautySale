import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { mockFlashSale } from "@/lib/data/mock";
import { FlashSaleForm } from "./FlashSaleForm";

export const dynamic = "force-dynamic";

export default async function AdminFlashSalePage() {
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();
  const { data } = await supabase
    .from("flash_sale")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  // No row yet => prefill with demo defaults so the admin starts from the current look.
  const current = data ?? { ...mockFlashSale, active: false };
  const exists = !!data;

  // Convert stored ISO (UTC) to a value usable by <input type="datetime-local">.
  let endsAtLocal = "";
  if (current.ends_at) {
    const d = new Date(current.ends_at);
    if (!Number.isNaN(d.getTime())) {
      const off = d.getTimezoneOffset();
      endsAtLocal = new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">promociones</p>
        <h1 className="font-display text-4xl mt-1">Flash Sale</h1>
        <p className="text-plum-soft mt-1">
          Banner de oferta con cuenta regresiva en la portada.
          {!exists && " Aún usás el ejemplo demo: guardá para tomar el control."}
        </p>
      </header>

      <FlashSaleForm
        current={{
          active: current.active,
          title: current.title,
          discount_label: current.discount_label,
          description: current.description,
          cta_link: current.cta_link,
          ends_at_local: endsAtLocal,
        }}
      />
    </div>
  );
}
