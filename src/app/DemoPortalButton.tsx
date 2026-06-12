"use client";

import { useState } from "react";
import { Store } from "lucide-react";

const DEMO_URL = "/t/beautysale";

// Frame del preview: iframe desktop escalado a miniatura.
const FRAME_W = 360;
const FRAME_H = 232;
const IFRAME_W = 1280;
const SCALE = FRAME_W / IFRAME_W;

// Botón "Ver demo en vivo" con borde degradado girando; al hover abre un
// portal flotante (overlay, no empuja layout) con miniatura en vivo del demo.
export function DemoPortalButton() {
  const [hover, setHover] = useState(false);
  // El iframe se monta recién en el primer hover para no cargar la tienda
  // en cada visita a la landing; después queda montado (sin recargas).
  const [mounted, setMounted] = useState(false);

  return (
    <div
      className="relative inline-flex justify-center"
      onMouseEnter={() => {
        setHover(true);
        setMounted(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      {/* Botón */}
      <a
        href={DEMO_URL}
        className="portal-ring relative inline-flex rounded-full p-[2.5px] transition-transform hover:scale-[1.03] active:scale-[0.98]"
      >
        <span
          className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold"
          style={{ backgroundColor: "#4A2511", color: "#ffe4cc" }}
        >
          <Store className="h-4 w-4" /> Ver demo en vivo
        </span>
      </a>

      {/* Portal flotante con miniatura (overlay: no desplaza el layout) */}
      <div
        className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
          hover
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-3 pointer-events-none"
        }`}
      >
        <a
          href={DEMO_URL}
          className="portal-ring portal-ring-fast portal-glow relative block rounded-[26px] p-[3px]"
        >
          <span
            className="relative z-10 block overflow-hidden rounded-[23px]"
            style={{ backgroundColor: "#4A2511" }}
          >
            <span
              className="block overflow-hidden"
              style={{ width: FRAME_W, height: FRAME_H }}
            >
              {mounted && (
                <iframe
                  src={DEMO_URL}
                  title="Demo BeautySale en vivo"
                  loading="lazy"
                  style={{
                    width: IFRAME_W,
                    height: FRAME_H / SCALE,
                    transform: `scale(${SCALE})`,
                    transformOrigin: "top left",
                    border: 0,
                    pointerEvents: "none",
                  }}
                />
              )}
            </span>
            <span
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 rounded-full px-3 py-1 text-[11px] font-bold"
              style={{ backgroundColor: "#ffe4cc", color: "#4A2511" }}
            >
              Entrar al demo →
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
