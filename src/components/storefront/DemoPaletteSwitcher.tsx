"use client";

import { useState } from "react";
import { Palette, X, RotateCcw } from "lucide-react";
import { PRESETS, paletteToCssVars, type Palette as PaletteT } from "@/lib/theme";

// Frame flotante SOLO para la tienda demo (showcase). Aplica la paleta
// elegida en el cliente como vista previa; no escribe nada al server.
export function DemoPaletteSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  function apply(id: string, palette: PaletteT) {
    const vars = paletteToCssVars(palette);
    for (const [k, v] of Object.entries(vars)) {
      document.documentElement.style.setProperty(k, v);
    }
    setActiveId(id);
  }

  function reset() {
    const vars = paletteToCssVars(PRESETS[0].palette);
    for (const k of Object.keys(vars)) {
      document.documentElement.style.removeProperty(k);
    }
    setActiveId(null);
  }

  return (
    <div className="fixed right-0 top-1/3 z-[55] flex items-start">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Probar paletas de colores"
          className="flex items-center gap-2 rounded-l-2xl bg-plum text-cream pl-3 pr-2.5 py-3 shadow-[0_8px_32px_rgba(45,27,78,0.35)] hover:pl-4 transition-all"
        >
          <Palette className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
            Paletas
          </span>
        </button>
      )}

      {open && (
        <div className="w-64 rounded-l-3xl bg-white/95 backdrop-blur-xl border border-plum/10 shadow-[0_16px_48px_rgba(45,27,78,0.25)] p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg">Probá los colores</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-plum/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-plum-soft">
            Vista previa en vivo — cada tienda elige su propia paleta desde su panel.
          </p>

          <div className="space-y-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => apply(p.id, p.palette)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-2.5 text-left transition hover:-translate-y-0.5 ${
                  activeId === p.id
                    ? "border-pink bg-pink/5 shadow-[0_4px_16px_rgba(255,77,139,0.15)]"
                    : "border-plum/10 hover:border-plum/25"
                }`}
              >
                <span className="flex shrink-0 -space-x-1.5">
                  {[p.palette.pink, p.palette.lavender, p.palette.butter, p.palette.plum].map(
                    (c, i) => (
                      <span
                        key={i}
                        className="h-6 w-6 rounded-full border-2 border-white"
                        style={{ backgroundColor: c }}
                      />
                    ),
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-plum leading-tight">{p.name}</span>
                  <span className="block text-[11px] text-plum-soft truncate">{p.tagline}</span>
                </span>
              </button>
            ))}
          </div>

          {activeId && (
            <button
              onClick={reset}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-plum/15 px-4 py-2 text-xs font-semibold hover:bg-plum/5 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Volver al original
            </button>
          )}
        </div>
      )}
    </div>
  );
}
