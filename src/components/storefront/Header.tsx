"use client";

import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart/store";
import { DEFAULT_SITE_NAME } from "@/lib/theme";

// Renders the brand wordmark. Default name keeps the two-tone "Beauty·Sale" look;
// any custom name renders with its last word accented in pink.
function Wordmark({ name }: { name: string }) {
  if (name === DEFAULT_SITE_NAME) {
    return (
      <>
        Beauty<span className="text-pink italic">Sale</span>
      </>
    );
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return <span className="text-pink italic">{parts[0]}</span>;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <span className="text-pink italic">{last}</span>
    </>
  );
}

const NAV = [
  { label: "Todos",            href: "/productos" },
  { label: "Cuidado personal", href: "/c/cuidado-personal" },
  { label: "Ojos",             href: "/c/ojos" },
  { label: "Labios",           href: "/c/labios" },
  { label: "Rostro",           href: "/c/rostro" },
];

export function Header({ logoUrl, siteName = DEFAULT_SITE_NAME }: { logoUrl?: string | null; siteName?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openCart, totalItems } = useCartStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const count = hydrated ? totalItems() : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-cream/85 backdrop-blur-md shadow-[0_8px_24px_rgba(45,27,78,0.08)] py-2"
          : "bg-cream py-4",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-4">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setMobileOpen(true)}
          className="md:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-plum/5"
        >
          <Menu className="h-5 w-5" />
        </button>

        <a href="/" className="font-display text-2xl md:text-3xl tracking-tight">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-9 md:h-11 w-auto object-contain" />
          ) : (
            <Wordmark name={siteName} />
          )}
        </a>

        <nav className="hidden md:flex items-center gap-1 mx-auto">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-plum hover:bg-pink/10 hover:text-pink transition"
            >
              {n.label}
            </a>
          ))}
          <a
            href="/ofertas"
            className="rounded-full px-3 py-2 text-sm font-bold text-pink hover:bg-pink hover:text-cream transition"
          >
            Ofertas 🔥
          </a>
        </nav>

        <div className="ml-auto md:ml-0 flex items-center gap-1">
          <button aria-label="Buscar" className="grid h-10 w-10 place-items-center rounded-full hover:bg-plum/5">
            <Search className="h-5 w-5" />
          </button>
          <button aria-label="Favoritos" className="hidden sm:grid h-10 w-10 place-items-center rounded-full hover:bg-plum/5">
            <Heart className="h-5 w-5" />
          </button>
          <button
            aria-label="Carrito"
            onClick={openCart}
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-plum/5"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-pink px-1 text-[10px] font-bold text-cream">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-plum/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-cream p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-2xl">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={siteName} className="h-9 w-auto object-contain" />
                ) : (
                  <Wordmark name={siteName} />
                )}
              </span>
              <button
                aria-label="Cerrar menú"
                onClick={() => setMobileOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-plum/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-2xl px-4 py-3 font-medium hover:bg-pink/10 hover:text-pink"
              >
                {n.label}
              </a>
            ))}
            <a
              href="/ofertas"
              className="rounded-2xl px-4 py-3 font-bold text-pink hover:bg-pink hover:text-cream"
            >
              Ofertas 🔥
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
