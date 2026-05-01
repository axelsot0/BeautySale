"use client";

import { useState } from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";

interface Props {
  productId: string;
  title: string;
  price: number;
  image: string | null;
  stock: number;
}

export function AddToCart({ productId, title, price, image, stock }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      addItem({ id: productId, title, price, image });
    }
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  }

  if (stock === 0) {
    return (
      <div className="rounded-full bg-plum/10 px-6 py-3.5 text-center font-semibold text-plum-soft">
        Sin stock
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Qty selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-plum/15 px-2 py-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-plum/5 transition"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-plum/5 transition"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-sm text-plum-soft">{stock} disponibles</span>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center justify-center gap-2 rounded-full bg-pink px-6 py-4 font-bold text-cream text-lg hover:shadow-[0_0_32px_rgba(255,77,139,0.45)] transition"
      >
        <ShoppingBag className="h-5 w-5" />
        {added ? "¡Agregado! ✓" : `Agregar · ${formatPrice(price * qty)}`}
      </button>
    </div>
  );
}
