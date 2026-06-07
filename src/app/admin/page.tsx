import { Megaphone, Package, Tag, Image as ImageIcon, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminTenantId } from "@/lib/tenant-context";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: "Pendiente", bg: "bg-butter",   text: "text-plum" },
  paid:      { label: "Pagado",    bg: "bg-mint",     text: "text-plum" },
  shipped:   { label: "Enviado",   bg: "bg-lavender", text: "text-cream" },
  delivered: { label: "Entregado", bg: "bg-plum",     text: "text-cream" },
  cancelled: { label: "Cancelado", bg: "bg-plum/10",  text: "text-plum/60" },
  failed:    { label: "Fallido",   bg: "bg-pink",     text: "text-cream" },
};

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
}

async function getStats() {
  const supabase = createServiceClient();
  const t = await getAdminTenantId();
  const [
    products,
    categories,
    banners,
    news,
    featured,
    onSale,
    paidOrders,
    pendingOrders,
    recentOrders,
    allOrdersForAggregation,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("tenant_id", t),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("tenant_id", t),
    supabase.from("banners").select("id", { count: "exact", head: true }).eq("tenant_id", t),
    supabase.from("news").select("id", { count: "exact", head: true }).eq("tenant_id", t),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("tenant_id", t).eq("featured", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("tenant_id", t).eq("on_sale", true),
    supabase.from("orders").select("total").eq("tenant_id", t).eq("status", "paid"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("tenant_id", t).eq("status", "pending"),
    supabase.from("orders").select("*").eq("tenant_id", t).order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("items").eq("tenant_id", t).in("status", ["paid", "shipped", "delivered"]),
  ]);

  const revenue = (paidOrders.data ?? []).reduce(
    (sum, o) => sum + Number(o.total ?? 0),
    0,
  );

  // Aggregate top products from order items
  const productCounts = new Map<string, { title: string; image: string | null; qty: number; revenue: number }>();
  for (const ord of allOrdersForAggregation.data ?? []) {
    const items = (Array.isArray(ord.items) ? ord.items : []) as unknown as OrderItem[];
    for (const item of items) {
      const existing = productCounts.get(item.id);
      if (existing) {
        existing.qty += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productCounts.set(item.id, {
          title: item.title,
          image: item.image ?? null,
          qty: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    }
  }
  const topProducts = Array.from(productCounts.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    products: products.count ?? 0,
    categories: categories.count ?? 0,
    banners: banners.count ?? 0,
    news: news.count ?? 0,
    featured: featured.count ?? 0,
    onSale: onSale.count ?? 0,
    paidOrders: paidOrders.data?.length ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    revenue,
    recentOrders: recentOrders.data ?? [],
    topProducts,
  };
}

export default async function AdminDashboard() {
  const s = await getStats();

  const cards = [
    { label: "Productos",  value: s.products,   href: "/admin/products",   icon: Package,   color: "bg-pink-soft" },
    { label: "Categorías", value: s.categories, href: "/admin/categories", icon: Tag,       color: "bg-mint-soft" },
    { label: "Banners",    value: s.banners,    href: "/admin/banners",    icon: ImageIcon, color: "bg-lavender-soft" },
    { label: "News",       value: s.news,       href: "/admin/news",       icon: Megaphone, color: "bg-butter-soft" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">Dashboard</p>
        <h1 className="font-display text-4xl md:text-5xl mt-1">Hola 💖</h1>
        <p className="text-plum-soft mt-2">Resumen rápido del estado de la tienda.</p>
      </header>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, href, icon: Icon, color }) => (
          <a
            key={label}
            href={href}
            className={`${color} rounded-[24px] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(45,27,78,0.1)]`}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className="h-5 w-5 text-plum/70" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-plum/60">Total</span>
            </div>
            <p className="font-display text-4xl text-plum">{value}</p>
            <p className="text-sm text-plum/70 mt-1">{label}</p>
          </a>
        ))}
      </div>

      {/* Catálogo + pedidos summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-[24px] bg-white p-6 border border-plum/5">
          <p className="text-xs font-bold uppercase tracking-widest text-plum-soft">Catálogo activo</p>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="font-display text-3xl">{s.featured}</p>
              <p className="text-sm text-plum-soft">Destacados</p>
            </div>
            <div>
              <p className="font-display text-3xl text-pink">{s.onSale}</p>
              <p className="text-sm text-plum-soft">En oferta</p>
            </div>
          </div>
        </div>

        <a href="/admin/orders" className="rounded-[24px] bg-white p-6 border border-plum/5 hover:border-pink/30 transition">
          <p className="text-xs font-bold uppercase tracking-widest text-plum-soft">Pedidos</p>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <ShoppingBag className="h-4 w-4 text-mint mb-1" />
              <p className="font-display text-3xl">{s.paidOrders}</p>
              <p className="text-xs text-plum-soft">Pagados</p>
            </div>
            <div>
              <ShoppingBag className="h-4 w-4 text-butter mb-1" />
              <p className="font-display text-3xl text-pink">{s.pendingOrders}</p>
              <p className="text-xs text-plum-soft">Pendientes</p>
            </div>
            <div>
              <DollarSign className="h-4 w-4 text-pink mb-1" />
              <p className="font-display text-2xl">{formatPrice(s.revenue)}</p>
              <p className="text-xs text-plum-soft">Revenue</p>
            </div>
          </div>
        </a>
      </div>

      {/* Top productos + recientes */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top productos */}
        <div className="rounded-[24px] bg-white p-6 border border-plum/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink" />
              <h2 className="font-display text-xl">Top productos</h2>
            </div>
            <span className="text-xs text-plum-soft">por unidades vendidas</span>
          </div>

          {s.topProducts.length > 0 ? (
            <ul className="space-y-3">
              {s.topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-pink/10 text-pink font-bold text-sm">
                    {i + 1}
                  </span>
                  <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-lavender/20">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-display text-lg text-plum/30">
                        {p.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                    <p className="text-xs text-plum-soft">
                      {p.qty} unidades · {formatPrice(p.revenue)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-plum-soft py-8 text-center">Sin pedidos aún</p>
          )}
        </div>

        {/* Pedidos recientes */}
        <div className="rounded-[24px] bg-white p-6 border border-plum/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Últimos pedidos</h2>
            <a href="/admin/orders" className="text-xs font-bold text-pink hover:underline">
              Ver todos →
            </a>
          </div>

          {s.recentOrders.length > 0 ? (
            <ul className="space-y-2">
              {s.recentOrders.map((o) => {
                const cfg = STATUS_LABEL[o.status] ?? STATUS_LABEL.pending;
                return (
                  <li key={o.id}>
                    <a
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-cream/40 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{o.customer_name}</p>
                        <p className="text-xs text-plum-soft">
                          {new Date(o.created_at).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-sm">{formatPrice(Number(o.total))}</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${cfg.bg} ${cfg.text} mt-0.5`}>
                          {cfg.label}
                        </span>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-plum-soft py-8 text-center">Sin pedidos aún</p>
          )}
        </div>
      </div>
    </div>
  );
}
