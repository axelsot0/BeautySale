import { Pencil, Plus, Star, Tag } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { DeleteButton } from "../_components/DeleteButton";
import { deleteProduct, toggleProductFeatured, toggleProductOnSale } from "./actions";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name, color)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-pink">catálogo</p>
          <h1 className="font-display text-4xl mt-1">Productos</h1>
          <p className="text-plum-soft mt-1">{products?.length ?? 0} productos en total</p>
        </div>
        <a
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-3 font-semibold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </a>
      </header>

      <div className="rounded-[24px] bg-white border border-plum/5 overflow-hidden">
        {products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-plum/5 text-xs uppercase tracking-wider text-plum-soft">
                  <th className="px-5 py-3 text-left">Producto</th>
                  <th className="px-3 py-3 text-left hidden md:table-cell">Categoría</th>
                  <th className="px-3 py-3 text-right">Precio</th>
                  <th className="px-3 py-3 text-center hidden sm:table-cell">Stock</th>
                  <th className="px-3 py-3 text-center">⭐</th>
                  <th className="px-3 py-3 text-center">🔥</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-plum/5">
                {products.map((p) => {
                  const cat = p.category as { name: string; color: string } | null;
                  const thumb = p.images?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-cream/40 transition">
                      {/* Product name + thumb */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt={p.title}
                              className="h-10 w-10 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-plum/5 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">{p.title}</p>
                            <p className="text-xs text-plum-soft">{p.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3 hidden md:table-cell">
                        {cat ? (
                          <span
                            className="inline-block rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                            style={{ background: cat.color }}
                          >
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-plum-soft text-xs">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-3 py-3 text-right font-mono font-semibold">
                        {formatPrice(p.price)}
                        {p.discount_percent > 0 && (
                          <span className="ml-1 text-[10px] text-pink font-bold">-{p.discount_percent}%</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-3 py-3 text-center hidden sm:table-cell">
                        <span
                          className={`text-xs font-bold ${p.stock === 0 ? "text-pink" : "text-plum-soft"}`}
                        >
                          {p.stock}
                        </span>
                      </td>

                      {/* Featured toggle */}
                      <td className="px-3 py-3 text-center">
                        <form action={toggleProductFeatured}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="current" value={String(p.featured)} />
                          <button
                            type="submit"
                            title={p.featured ? "Quitar destacado" : "Marcar destacado"}
                            className={`h-7 w-7 rounded-full grid place-items-center transition ${
                              p.featured ? "bg-butter text-plum" : "bg-plum/5 text-plum/30 hover:text-plum/60"
                            }`}
                          >
                            <Star className="h-3.5 w-3.5" fill={p.featured ? "currentColor" : "none"} />
                          </button>
                        </form>
                      </td>

                      {/* On sale toggle */}
                      <td className="px-3 py-3 text-center">
                        <form action={toggleProductOnSale}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="current" value={String(p.on_sale)} />
                          <button
                            type="submit"
                            title={p.on_sale ? "Quitar oferta" : "Poner en oferta"}
                            className={`h-7 w-7 rounded-full grid place-items-center transition ${
                              p.on_sale ? "bg-pink text-white" : "bg-plum/5 text-plum/30 hover:text-plum/60"
                            }`}
                          >
                            <Tag className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <a
                            href={`/admin/products/${p.id}`}
                            aria-label="Editar"
                            className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5"
                          >
                            <Pencil className="h-4 w-4" />
                          </a>
                          <DeleteButton action={deleteProduct} id={p.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-plum-soft">
            Sin productos todavía.{" "}
            <a href="/admin/products/new" className="text-pink font-semibold hover:underline">
              Creá el primero
            </a>
            .
          </div>
        )}
      </div>
    </div>
  );
}
