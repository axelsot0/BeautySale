import { Megaphone, Package, Tag, Image as ImageIcon, ShoppingBag, DollarSign } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = createServiceClient();
  const [
    products,
    categories,
    banners,
    news,
    featured,
    onSale,
    paidOrders,
    pendingOrders,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("banners").select("id", { count: "exact", head: true }),
    supabase.from("news").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("featured", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("on_sale", true),
    supabase.from("orders").select("total").eq("status", "paid"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const revenue = (paidOrders.data ?? []).reduce(
    (sum, o) => sum + Number(o.total ?? 0),
    0,
  );

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, href, icon: Icon, color }) => (
          <a
            key={label}
            href={href}
            className={`${color} rounded-[24px] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(45,27,78,0.1)]`}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className="h-5 w-5 text-plum/70" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-plum/60">
                Total
              </span>
            </div>
            <p className="font-display text-4xl text-plum">{value}</p>
            <p className="text-sm text-plum/70 mt-1">{label}</p>
          </a>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-[24px] bg-white p-6 border border-plum/5">
          <p className="text-xs font-bold uppercase tracking-widest text-plum-soft">
            Catálogo activo
          </p>
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

        <div className="rounded-[24px] bg-white p-6 border border-plum/5">
          <p className="text-xs font-bold uppercase tracking-widest text-plum-soft">
            Pedidos
          </p>
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
              <p className="font-display text-2xl">${s.revenue.toFixed(2)}</p>
              <p className="text-xs text-plum-soft">Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
