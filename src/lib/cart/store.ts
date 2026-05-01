import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;          // product id
  title: string;
  price: number;       // final price (already discounted)
  image: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];

  // ── Drawer UI ─────────────────────────────────────────────
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  /** Add one unit. If already in cart, increment qty. */
  addItem: (item: Omit<CartItem, "quantity">) => void;

  /** Remove item completely. */
  removeItem: (id: string) => void;

  /** Set exact quantity. Removes if qty <= 0. */
  setQuantity: (id: string, quantity: number) => void;

  /** Empty the cart. */
  clear: () => void;

  // ── Derived ──────────────────────────────────────────────
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem(item) {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem(id) {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      setQuantity(id, quantity) {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clear() {
        set({ items: [] });
      },

      totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    {
      name: "beautysale-cart", // localStorage key
      version: 1,
    },
  ),
);
