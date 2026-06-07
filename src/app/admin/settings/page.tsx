import { createServiceClient } from "@/lib/supabase/service";
import { PayPalForm } from "./PayPalForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("paypal_client_id, paypal_secret, paypal_mode")
    .eq("id", 1)
    .single();

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">ajustes</p>
        <h1 className="font-display text-4xl mt-1">Pagos</h1>
        <p className="text-plum-soft mt-1">
          Conectá tu cuenta de PayPal Business. Los cobros del checkout llegan a esta cuenta. Si
          dejás los campos vacíos, se usan las credenciales por defecto del sistema.
        </p>
      </header>

      <PayPalForm
        clientId={(data?.paypal_client_id as string | null) ?? ""}
        mode={(data?.paypal_mode as string | null) === "live" ? "live" : "sandbox"}
        hasSecret={Boolean(data?.paypal_secret)}
      />
    </div>
  );
}
