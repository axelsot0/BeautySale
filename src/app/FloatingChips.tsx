"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, Heart, Zap, Star, Wand2, ShoppingBag, Palette,
  MessageCircle, Gem, Rocket, Crown, Flower2,
  type LucideIcon,
} from "lucide-react";

// Pool de mensajes "catchy". En cada refresh se eligen 5 al azar y flotan
// alrededor del título. Al pasar el mouse, se agitan.
const POOL: { text: string; icon: LucideIcon }[] = [
  { text: "Tu tienda online en minutos", icon: Sparkles },
  { text: "Sin código, sin enredos", icon: Wand2 },
  { text: "Cobrá por WhatsApp", icon: MessageCircle },
  { text: "Diseño que enamora", icon: Heart },
  { text: "Flash sales en un clic", icon: Zap },
  { text: "Tu marca, tus colores", icon: Palette },
  { text: "Probala gratis 15 días", icon: Star },
  { text: "Catálogo en segundos", icon: ShoppingBag },
  { text: "Vendé mientras dormís", icon: Rocket },
  { text: "Hecho para emprendedoras", icon: Crown },
  { text: "Subí productos en 1 min", icon: Gem },
  { text: "Belleza que se vende sola", icon: Flower2 },
  { text: "Pedidos sin fricción", icon: ShoppingBag },
  { text: "Glow up para tu negocio", icon: Sparkles },
  { text: "Listo para móvil", icon: Zap },
  { text: "Del demo a la venta", icon: Rocket },
];

// Posiciones alrededor del título (periferia, sin tapar el centro/CTAs).
const SLOTS = [
  { top: "6%", left: "4%" },
  { top: "14%", right: "5%" },
  { top: "30%", left: "1%" },
  { top: "34%", right: "2%" },
  { top: "0%", left: "38%" },
  { top: "58%", left: "8%" },
  { top: "60%", right: "9%" },
  { top: "48%", right: "0%" },
];

type Chip = {
  text: string;
  icon: LucideIcon;
  slot: { top: string; left?: string; right?: string };
  dur: number;
  delay: number;
  rot: number;
};

function pick(): Chip[] {
  const msgs = [...POOL].sort(() => Math.random() - 0.5).slice(0, 5);
  const slots = [...SLOTS].sort(() => Math.random() - 0.5).slice(0, 5);
  return msgs.map((m, i) => ({
    text: m.text,
    icon: m.icon,
    slot: slots[i],
    dur: 5 + Math.random() * 4, // 5–9s
    delay: Math.random() * 2.5,
    rot: (Math.random() * 2 - 1) * 5, // -5..5 deg
  }));
}

export function FloatingChips() {
  // Se eligen en el cliente para que cambien en cada refresh sin desajustar SSR.
  const [chips, setChips] = useState<Chip[]>([]);
  useEffect(() => setChips(pick()), []);

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
      {chips.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="animate-fade-up absolute"
            style={{ top: c.slot.top, left: c.slot.left, right: c.slot.right, animationDelay: `${c.delay * 0.4}s` }}
          >
            <span
              className="chip-float pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-plum/10 bg-white/85 px-3.5 py-1.5 text-xs font-bold text-plum shadow-[0_8px_24px_rgba(45,27,78,0.10)] backdrop-blur-sm whitespace-nowrap cursor-default select-none"
              style={
                {
                  "--chip-dur": `${c.dur}s`,
                  "--chip-delay": `${c.delay}s`,
                  "--chip-rot": `${c.rot}deg`,
                } as React.CSSProperties
              }
            >
              <Icon className="h-3.5 w-3.5 text-pink" />
              {c.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
