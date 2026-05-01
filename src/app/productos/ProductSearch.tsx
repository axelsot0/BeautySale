"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";
import type { Product, Category } from "@/lib/data/types";
import { ProductCard } from "@/components/storefront/ProductCard";

interface Props {
  products: Product[];
  categories: Category[];
}

const SORT_OPTIONS = [
  { value: "default",    label: "Más recientes" },
  { value: "price-asc",  label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
  { value: "discount",   label: "Mayor descuento" },
];

export function ProductSearch({ products, categories }: Props) {
  const [query, setQuery]           = useState("");
  const [catFilter, setCatFilter]   = useState<string | null>(null);
  const [sort, setSort]             = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const panelRef  = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Close filter panel on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [filterOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFilterOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
      );
    }

    // Category
    if (catFilter) {
      list = list.filter((p) => p.category_id === catFilter);
    }

    // Sort
    if (sort === "price-asc")  list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "discount")   list.sort((a, b) => b.discount_percent - a.discount_percent);

    return list;
  }, [products, query, catFilter, sort]);

  const activeCategory = categories.find((c) => c.id === catFilter);
  const activeFilters  = (catFilter ? 1 : 0) + (sort !== "default" ? 1 : 0);

  return (
    <div className="relative">
      {/* Results count */}
      <p className="text-sm text-plum-soft mb-6">
        {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
        {query && <span> para "<strong>{query}</strong>"</span>}
        {activeCategory && <span> en <strong>{activeCategory.name}</strong></span>}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-32">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-plum-soft pb-32">
          <Search className="h-14 w-14 opacity-20" />
          <p className="font-display text-2xl">Sin resultados</p>
          <p className="text-sm">Probá con otro término o eliminá los filtros.</p>
          <button
            onClick={() => { setQuery(""); setCatFilter(null); setSort("default"); }}
            className="mt-2 rounded-full border border-plum/15 px-5 py-2.5 text-sm font-semibold hover:bg-plum/5 transition"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* ── Sticky bottom bar ─────────────────────────────────── */}
      <div className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <div
          ref={panelRef}
          className="pointer-events-auto w-full max-w-lg flex flex-col gap-2"
        >
          {/* Filter panel — slides up above the bar */}
          <div
            className={`
              transition-all duration-300 origin-bottom
              ${filterOpen
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95 pointer-events-none"
              }
            `}
          >
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_40px_rgba(45,27,78,0.18)] p-4 space-y-4">
              {/* Sort */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-plum-soft mb-2">Ordenar</p>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setSort(o.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                        sort === o.value
                          ? "bg-plum text-cream"
                          : "bg-plum/8 text-plum hover:bg-plum/15"
                      }`}
                    >
                      {sort === o.value && <Check className="h-3 w-3" />}
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-plum-soft mb-2">Categoría</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCatFilter(null)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                      !catFilter
                        ? "bg-pink text-cream"
                        : "bg-plum/8 text-plum hover:bg-plum/15"
                    }`}
                  >
                    {!catFilter && <Check className="h-3 w-3" />}
                    Todas
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCatFilter(catFilter === c.id ? null : c.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
                        catFilter === c.id
                          ? "text-white"
                          : "bg-plum/8 text-plum hover:bg-plum/15"
                      }`}
                      style={catFilter === c.id ? { backgroundColor: c.color } : undefined}
                    >
                      {catFilter === c.id && <Check className="h-3 w-3" />}
                      {c.icon && <span>{c.icon}</span>}
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_rgba(45,27,78,0.14)] px-4 py-3">
            <Search className="h-4 w-4 text-plum-soft shrink-0" />

            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos…"
              className="flex-1 bg-transparent outline-none text-sm text-plum placeholder:text-plum-soft"
            />

            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 grid h-6 w-6 place-items-center rounded-full bg-plum/8 hover:bg-plum/15 transition"
              >
                <X className="h-3.5 w-3.5 text-plum" />
              </button>
            )}

            {/* Divider */}
            <div className="h-5 w-px bg-plum/15 mx-1 shrink-0" />

            {/* Filter button */}
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filterOpen || activeFilters > 0
                  ? "bg-pink text-cream"
                  : "bg-plum/8 text-plum hover:bg-pink hover:text-cream"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtrar
              {activeFilters > 0 && (
                <span className="grid h-4 w-4 place-items-center rounded-full bg-white/30 text-[10px] font-bold">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
