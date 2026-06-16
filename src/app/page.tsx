import { ShoppingBag, MessageCircle, Palette, Zap, ArrowRight, Check } from "lucide-react";
import { ProPromoForm } from "./ProPromoForm";
import { DemoPortalButton } from "./DemoPortalButton";
import { FloatingChips } from "./FloatingChips";
import { PLAN_PRICES, PRO_DISCOUNT_PCT } from "@/lib/plans";

export const dynamic = "force-dynamic";

// La landing es de la plataforma: no hereda el título del tenant de la cookie.
export const metadata = {
  title: "BeautySale — Tu tienda de belleza online en minutos",
  description:
    "Lanzá tu tienda de belleza sin código. Catálogo, pagos, WhatsApp y diseño personalizable.",
};

const PLAN_CARDS = [
  {
    name: "Demo",
    price: "Gratis",
    period: "15 días",
    perks: ["Catálogo y pedidos", "Hero personalizable", "Cobro por WhatsApp manual"],
    highlight: false,
  },
  {
    name: "Basic",
    price: `$${PLAN_PRICES.basic}`,
    period: "/mes",
    perks: ["Todo lo del demo", "Tema y colores propios", "Flash sales y marcas", "Secciones de portada"],
    highlight: false,
  },
  {
    name: "Pro",
    price: `$${PLAN_PRICES.pro}`,
    period: "/mes",
    perks: ["Todo lo de Basic", "Secciones personalizadas", "Múltiples admins", "Soporte prioritario"],
    highlight: true,
  },
];

const FEATURES = [
  { icon: ShoppingBag, title: "Catálogo y pedidos", desc: "Cargá productos, categorías y recibí pedidos con seguimiento de estado." },
  { icon: MessageCircle, title: "Cobro por WhatsApp", desc: "Tus clientes piden y coordinan el pago directo por WhatsApp, sin fricción." },
  { icon: Palette, title: "Diseño a tu marca", desc: "Tema, colores, hero, secciones de portada y footer 100% configurables." },
  { icon: Zap, title: "Flash sales y descuentos", desc: "Ofertas con cuenta regresiva y códigos de descuento para tu newsletter." },
];

const STEPS = [
  { n: "1", title: "Creá tu tienda demo", desc: "Registrate en 30 segundos. Tu tienda queda lista en modo demostración." },
  { n: "2", title: "Cargá tus productos", desc: "Probá el panel, subí tu catálogo y personalizá el inicio de tu tienda." },
  { n: "3", title: "Activá y vendé", desc: "Cuando estés listo, activamos tu tienda con todas las funciones premium." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-plum flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <a href="/" className="font-display text-2xl">
            Beauty<span className="text-pink italic">Sale</span>
          </a>
          <div className="flex items-center gap-2">
            <a href="/admin/login" className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-plum/5 transition">
              Entrar
            </a>
            <a href="/signup" className="rounded-full bg-pink px-5 py-2 text-sm font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition">
              Crear mi tienda
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-16 h-80 w-80 rounded-full bg-pink/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-lavender/30 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-28 text-center">
          <FloatingChips />
          <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mt-6 max-w-3xl mx-auto relative">
            Lanzá tu tienda de belleza <span className="italic text-pink">sin código</span> y empezá a vender hoy
          </h1>
          <p className="text-plum-soft text-lg mt-5 max-w-xl mx-auto">
            Catálogo, pedidos, cobros por WhatsApp y un diseño que enamora. Probala gratis en modo demo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-pink px-7 py-3.5 font-bold text-cream hover:shadow-[0_0_24px_rgba(255,77,139,0.4)] transition">
              Crear mi tienda gratis <ArrowRight className="h-4 w-4" />
            </a>
            <DemoPortalButton />
          </div>
          <p className="text-xs text-plum-soft mt-4">Sin tarjeta de crédito · Modo demo por 15 días</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 w-full">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-[24px] bg-white border border-plum/5 p-6 space-y-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-pink/10">
                <f.icon className="h-5 w-5 text-pink" />
              </div>
              <h3 className="font-display text-lg">{f.title}</h3>
              <p className="text-sm text-plum-soft leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 w-full">
        <h2 className="font-display text-3xl md:text-4xl text-center">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center space-y-3">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-plum text-cream font-display text-2xl">
                {s.n}
              </div>
              <h3 className="font-display text-xl">{s.title}</h3>
              <p className="text-sm text-plum-soft max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 w-full">
        <h2 className="font-display text-3xl md:text-4xl text-center">Planes simples</h2>
        <p className="text-plum-soft text-center mt-2">Empezá gratis, crecé cuando lo necesites.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {PLAN_CARDS.map((p) => (
            <div
              key={p.name}
              className={`rounded-[28px] p-7 space-y-5 ${
                p.highlight
                  ? "bg-plum text-cream shadow-[0_24px_60px_rgba(45,27,78,0.25)]"
                  : "bg-white border border-plum/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl">{p.name}</h3>
                {p.highlight && (
                  <span className="rounded-full bg-pink px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                    Popular
                  </span>
                )}
              </div>
              <p>
                <span className="font-display text-4xl">{p.price}</span>
                <span className={p.highlight ? "text-cream/60" : "text-plum-soft"}> {p.period}</span>
              </p>
              <ul className="space-y-2 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <Check className={`h-4 w-4 shrink-0 ${p.highlight ? "text-mint" : "text-pink"}`} />
                    {perk}
                  </li>
                ))}
              </ul>
              <a
                href={
                  p.name === "Demo"
                    ? "/signup"
                    : `/suscribir?plan=${p.name.toLowerCase()}`
                }
                className={`block text-center rounded-full px-6 py-3 font-bold transition ${
                  p.highlight
                    ? "bg-pink text-cream hover:opacity-90"
                    : "bg-plum/5 text-plum hover:bg-plum hover:text-cream"
                }`}
              >
                {p.name === "Demo" ? "Empezar gratis" : "Comprar"}
              </a>
            </div>
          ))}
        </div>

        {/* Promo 30% Pro */}
        <div className="mt-10 rounded-[28px] bg-butter/20 border border-butter/40 p-7 md:p-9 text-center max-w-2xl mx-auto">
          <h3 className="font-display text-2xl">
            {PRO_DISCOUNT_PCT}% OFF en tu primer mes Pro
          </h3>
          <p className="text-plum-soft text-sm mt-2 mb-5">
            Dejá tu correo y te damos un código de descuento único para el plan Pro.
          </p>
          <ProPromoForm />
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 w-full">
        <div className="relative overflow-hidden rounded-[32px] bg-plum text-cream p-10 md:p-16 text-center">
          <div className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-pink/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl">Tu tienda te está esperando</h2>
            <p className="text-cream/70 mt-3 max-w-md mx-auto">
              Creala gratis hoy y personalizala a tu gusto antes de salir a vender.
            </p>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm text-cream/80">
              {["Sin instalar nada", "Listo en minutos", "Soporte en español"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-mint" /> {t}
                </li>
              ))}
            </ul>
            <a href="/signup" className="inline-flex items-center gap-2 rounded-full bg-pink px-7 py-3.5 font-bold text-cream hover:opacity-90 transition mt-8">
              Crear mi tienda gratis <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-plum/10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-plum-soft">
          <a href="/" className="font-display text-xl text-plum">
            Beauty<span className="text-pink italic">Sale</span>
          </a>
          <p>© {new Date().getFullYear()} BeautySale. Hecho con 💖.</p>
          <a href="/admin/login" className="hover:text-pink transition">Acceso dueños</a>
        </div>
      </footer>
    </div>
  );
}
