"use client";

import { useEffect, useState } from "react";
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
  // Ciclo automático: cada 5 s se intercambian botón y portal.
  // El hover fuerza el portal y pausa el ciclo.
  const [autoOpen, setAutoOpen] = useState(false);
  // El iframe se monta recién la primera vez que se abre el portal;
  // después queda montado (sin recargas).
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const show = hover || autoOpen;

  useEffect(() => {
    if (hover) return; // pausado mientras el mouse está encima
    const id = setInterval(() => setAutoOpen((p) => !p), 5000);
    return () => clearInterval(id);
  }, [hover]);

  useEffect(() => {
    if (show) setMounted(true);
  }, [show]);

  return (
    <div
      className="relative inline-flex justify-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Botón (se desvanece cuando el portal está abierto) */}
      <a
        href={DEMO_URL}
        className={`portal-ring relative inline-flex rounded-full p-[2.5px] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
          show ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
        }`}
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
          show
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
              className="relative block overflow-hidden"
              style={{ width: FRAME_W, height: FRAME_H }}
            >
              {/* Skeleton mientras carga el iframe */}
              {!loaded && (
                <span className="absolute inset-0 z-10 grid place-items-center">
                  <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#5a2f17] via-[#4A2511] to-[#5a2f17]" />
                  <span className="relative grid place-items-center">
                    <span className="absolute h-14 w-14 rounded-full animate-ping" style={{ backgroundColor: "rgba(255,228,204,0.25)" }} />
                    <span className="relative grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: "#ffe4cc" }}>
                      <Store className="h-5 w-5" style={{ color: "#4A2511" }} />
                    </span>
                    <span className="relative mt-3 text-xs font-bold" style={{ color: "#ffe4cc" }}>
                      Abriendo portal…
                    </span>
                  </span>
                </span>
              )}
              {mounted && (
                <iframe
                  src={DEMO_URL}
                  title="Demo BeautySale en vivo"
                  loading="lazy"
                  onLoad={() => setLoaded(true)}
                  className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
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
