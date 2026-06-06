import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Mail, User, Calendar, Package } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { formatPrice } from "@/lib/utils";
import { updateOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "pending",   label: "Pendiente",  color: "bg-butter text-plum" },
  { value: "paid",      label: "Pagado",     color: "bg-mint text-plum" },
  { value: "shipped",   label: "Enviado",    color: "bg-lavender text-cream" },
  { value: "delivered", label: "Entregado",  color: "bg-plum text-cream" },
  { value: "cancelled", label: "Cancelado",  color: "bg-plum/10 text-plum/60" },
  { value: "failed",    label: "Fallido",    color: "bg-pink text-cream" },
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!order) notFound();

  const items = (Array.isArray(order.items) ? order.items : []) as {
    id: string; title: string; price: number; quantity: number; image?: string | null;
  }[];

  const addr = order.shipping_address as {
    street?: string; city?: string; state?: string; zip?: string; country?: string;
  } | null;

  const currentStatus = order.status as string;

  return (
    <div className="space-y-6 max-w-5xl">
      <a
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-plum-soft hover:text-pink transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pedidos
      </a>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pink">pedido</p>
          <h1 className="font-display text-4xl mt-1">#{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-plum-soft mt-1 font-mono text-xs">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl">{formatPrice(Number(order.total))}</p>
          <p className="text-xs text-plum-soft">Total</p>
        </div>
      </header>

      {/* Status changer */}
      <form action={updateOrderStatus} className="rounded-[24px] bg-white border border-plum/5 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-plum-soft">Estado del pedido</p>
        <input type="hidden" name="id" value={order.id} />
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="submit"
              name="status"
              value={s.value}
              disabled={currentStatus === s.value}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                currentStatus === s.value
                  ? `${s.color} cursor-default ring-2 ring-pink ring-offset-2`
                  : "bg-plum/8 text-plum hover:bg-plum/15 cursor-pointer"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-plum-soft">Click en un estado para cambiarlo.</p>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Customer */}
        <div className="rounded-[24px] bg-white border border-plum/5 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-plum-soft">Cliente</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-plum-soft mt-0.5 shrink-0" />
              <span>{order.customer_name}</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-plum-soft mt-0.5 shrink-0" />
              <a href={`mailto:${order.customer_email}`} className="text-pink hover:underline break-all">
                {order.customer_email}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-plum-soft mt-0.5 shrink-0" />
              <span>
                {new Date(order.created_at).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-[24px] bg-white border border-plum/5 p-5 space-y-3 md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-plum-soft flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Dirección de envío
          </p>
          {addr ? (
            <div className="text-sm space-y-1">
              <p className="font-medium">{addr.street}</p>
              <p>{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zip ?? ""}</p>
              <p className="text-plum-soft">{addr.country}</p>
            </div>
          ) : (
            <p className="text-sm text-plum-soft">Sin dirección registrada</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-[24px] bg-white border border-plum/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-plum/5 flex items-center gap-2">
          <Package className="h-4 w-4 text-pink" />
          <p className="font-display text-lg">Productos ({items.reduce((s, i) => s + i.quantity, 0)})</p>
        </div>
        <ul className="divide-y divide-plum/5">
          {items.map((item, i) => (
            <li key={`${item.id}-${i}`} className="px-5 py-3 flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-lavender/20">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-display text-xl text-plum/30">
                    {item.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1">{item.title}</p>
                <p className="text-xs text-plum-soft">{formatPrice(item.price)} × {item.quantity}</p>
              </div>
              <span className="font-mono font-bold">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="px-5 py-3 border-t border-plum/5 flex items-center justify-between bg-cream/30">
          <span className="font-display text-sm">Subtotal</span>
          <span className="font-mono font-bold">{formatPrice(Number(order.subtotal))}</span>
        </div>
        <div className="px-5 py-3 flex items-center justify-between bg-cream/30 border-t border-plum/5">
          <span className="font-display text-lg">Total</span>
          <span className="font-display text-2xl text-pink">{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      {/* PayPal info */}
      {order.paypal_order_id && (
        <div className="rounded-2xl bg-plum/5 px-4 py-3 text-xs text-plum-soft">
          PayPal Order ID: <span className="font-mono">{order.paypal_order_id}</span>
        </div>
      )}
    </div>
  );
}
