import { Eye, ShoppingBag, MessageCircle, CreditCard } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: "Pendiente", bg: "bg-butter",      text: "text-plum" },
  paid:      { label: "Pagado",    bg: "bg-mint",        text: "text-plum" },
  shipped:   { label: "Enviado",   bg: "bg-lavender",    text: "text-cream" },
  delivered: { label: "Entregado", bg: "bg-plum",        text: "text-cream" },
  cancelled: { label: "Cancelado", bg: "bg-plum/10",     text: "text-plum/60" },
  declined:  { label: "Declinado", bg: "bg-plum/10",    text: "text-plum/60" },
  failed:    { label: "Fallido",   bg: "bg-pink",        text: "text-cream" },
};

interface SearchParams {
  status?: string;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status } = await searchParams;
  const supabase = createServiceClient();
  const tenantId = await getAdminTenantId();

  let q = supabase
    .from("orders")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);

  const { data: orders } = await q;

  const filters = ["pending", "paid", "shipped", "delivered", "cancelled", "declined", "failed"];

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">ventas</p>
        <h1 className="font-display text-4xl mt-1">Pedidos</h1>
        <p className="text-plum-soft mt-1">{orders?.length ?? 0} {(orders?.length ?? 0) === 1 ? "pedido" : "pedidos"}</p>
      </header>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/orders"
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
            !status ? "bg-plum text-cream" : "bg-plum/8 text-plum hover:bg-plum/15"
          }`}
        >
          Todos
        </a>
        {filters.map((s) => {
          const cfg = STATUS_STYLE[s];
          return (
            <a
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                status === s ? `${cfg.bg} ${cfg.text}` : "bg-plum/8 text-plum hover:bg-plum/15"
              }`}
            >
              {cfg.label}
            </a>
          );
        })}
      </div>

      <div className="rounded-[24px] bg-white border border-plum/5 overflow-hidden">
        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-plum/5 text-xs uppercase tracking-wider text-plum-soft">
                  <th className="px-5 py-3 text-left">Cliente</th>
                  <th className="px-3 py-3 text-left hidden md:table-cell">Email</th>
                  <th className="px-3 py-3 text-left hidden lg:table-cell">Items</th>
                  <th className="px-3 py-3 text-right">Total</th>
                  <th className="px-3 py-3 text-center hidden sm:table-cell">Via</th>
                  <th className="px-3 py-3 text-center">Estado</th>
                  <th className="px-3 py-3 text-left hidden lg:table-cell">Fecha</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-plum/5">
                {orders.map((o) => {
                  const cfg = STATUS_STYLE[o.status] ?? STATUS_STYLE.pending;
                  const items = (Array.isArray(o.items) ? o.items : []) as { quantity: number }[];
                  const itemCount = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
                  return (
                    <tr key={o.id} className="hover:bg-cream/40 transition">
                      <td className="px-5 py-3">
                        <p className="font-medium">{o.customer_name}</p>
                        <p className="text-xs text-plum-soft md:hidden truncate">{o.customer_email}</p>
                      </td>
                      <td className="px-3 py-3 text-plum-soft hidden md:table-cell">{o.customer_email}</td>
                      <td className="px-3 py-3 hidden lg:table-cell">{itemCount} unidades</td>
                      <td className="px-3 py-3 text-right font-mono font-bold">{formatPrice(Number(o.total))}</td>
                      <td className="px-3 py-3 text-center hidden sm:table-cell">
                        {o.source === "whatsapp" ? (
                          <span title="WhatsApp" className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#25D366]/15 text-[#25D366]">
                            <MessageCircle className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span title="PayPal" className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-plum/8 text-plum/40">
                            <CreditCard className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-plum-soft hidden lg:table-cell">
                        {new Date(o.created_at).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-3">
                        <a
                          href={`/admin/orders/${o.id}`}
                          aria-label="Ver detalle"
                          className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-plum-soft">
            <ShoppingBag className="h-12 w-12 mx-auto opacity-20 mb-2" />
            <p>{status ? "Sin pedidos en este estado" : "Sin pedidos todavía"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
