"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getDict, readClientLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, setQuantity, subtotal, totalItems } = useCartStore();
  const [hydrated, setHydrated] = useState(false);
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    setHydrated(true);
    setLocale(readClientLocale());
  }, []);
  const count = hydrated ? totalItems() : 0;
  const t = getDict(locale);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-plum/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-[−8px_0_40px_rgba(45,27,78,0.15)]",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Carrito"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-plum/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-pink" />
            <h2 className="font-display text-xl">
              {t.cart_title}
              {count > 0 && (
                <span className="ml-2 text-sm font-sans font-normal text-plum-soft">
                  ({count} {count === 1 ? t.cart_one : t.cart_many})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            aria-label={t.close_cart}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-plum-soft">
              <ShoppingBag className="h-16 w-16 opacity-20" />
              <p className="font-medium">{t.cart_empty}</p>
              <button
                onClick={closeCart}
                className="rounded-full border border-plum/20 px-5 py-2 text-sm font-semibold hover:bg-plum/5 transition"
              >
                {t.keep_shopping}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                {/* Image */}
                <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-lavender/20">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-3xl text-plum/20">
                        {item.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{item.title}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={t.remove}
                      className="shrink-0 grid h-7 w-7 place-items-center rounded-full hover:bg-pink/10 text-plum-soft hover:text-pink transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Qty controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        aria-label="Restar"
                        className="grid h-7 w-7 place-items-center rounded-full bg-plum/5 hover:bg-pink hover:text-cream transition text-sm font-bold"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        aria-label="Sumar"
                        className="grid h-7 w-7 place-items-center rounded-full bg-plum/5 hover:bg-pink hover:text-cream transition text-sm font-bold"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <span className="font-display text-lg">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-plum/10 px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-plum-soft">{t.subtotal}</span>
              <span className="font-display text-2xl">{formatPrice(subtotal())}</span>
            </div>
            <p className="text-xs text-plum-soft">{t.shipping_note}</p>
            <a
              href="/checkout"
              onClick={closeCart}
              className="block w-full rounded-full bg-pink py-3.5 text-center font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition"
            >
              {t.go_checkout}
            </a>
            <button
              onClick={closeCart}
              className="block w-full rounded-full border border-plum/15 py-2.5 text-center text-sm font-semibold hover:bg-plum/5 transition"
            >
              {t.keep_shopping}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
