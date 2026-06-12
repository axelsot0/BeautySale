"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Pencil, X, LayoutDashboard, Check } from "lucide-react";

const Ctx = createContext(false);

export function useEditMode() {
  return useContext(Ctx);
}

// Envuelve el storefront cuando el visitante es admin de ESTA tienda.
// Muestra un FAB para activar el modo edición; en modo edición cada
// <Editable> se vuelve clickeable.
export function EditModeProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);

  return (
    <Ctx.Provider value={active}>
      {children}

      {active ? (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-full bg-plum text-cream pl-5 pr-2 py-2 shadow-[0_16px_48px_rgba(45,27,78,0.4)]">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint" />
            </span>
            Modo edición — tocá un elemento
          </span>
          <a
            href="/admin/editor"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold hover:bg-cream/20 transition"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Editor completo
          </a>
          <button
            onClick={() => setActive(false)}
            aria-label="Salir del modo edición"
            className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 hover:bg-cream/20 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setActive(true)}
          className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-plum text-cream px-5 py-3.5 font-semibold text-sm shadow-[0_16px_48px_rgba(45,27,78,0.35)] hover:scale-105 active:scale-95 transition-transform"
        >
          <Pencil className="h-4 w-4" />
          Editar mi tienda
        </button>
      )}
    </Ctx.Provider>
  );
}

export function SavedToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 rounded-full bg-mint text-plum px-5 py-2.5 text-sm font-bold shadow-lg">
      <Check className="h-4 w-4" /> Guardado
    </div>
  );
}
