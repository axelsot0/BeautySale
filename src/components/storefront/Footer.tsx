import { Mail } from "lucide-react";
import { getSocialLinks } from "@/lib/data/queries";
import { getActiveTheme } from "@/lib/data/theme-query";
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { SOCIAL_NETWORKS, socialHref, type SocialKey } from "@/lib/social";
import { NewsletterForm } from "./NewsletterForm";

// Brand icons (lucide-react v1 removed brand icons for legal reasons; using inline SVGs).
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 8.3a6.7 6.7 0 0 1-3.9-1.2v6.6a5.5 5.5 0 1 1-5.5-5.5v2.7a2.8 2.8 0 1 0 2.8 2.8V2h2.7a4 4 0 0 0 4 4z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13 22v-8h2.7l.4-3.1H13V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4v2.4H7v3.1h2.9V22z" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.4 14.3c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6s.6-1.9.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.4-.4.5c-.1.1-.3.3-.1.5.1.3.7 1.1 1.4 1.8 1 .8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.6-.7c.2-.3.3-.2.6-.1l1.9.9c.2.1.4.2.5.3 0 .1 0 .7-.2 1.3z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<SocialKey, { icon: React.FC<React.SVGProps<SVGSVGElement>>; hover: string }> = {
  instagram: { icon: InstagramIcon, hover: "hover:bg-pink" },
  tiktok: { icon: TikTokIcon, hover: "hover:bg-mint hover:text-plum" },
  whatsapp: { icon: WhatsAppIcon, hover: "hover:bg-mint hover:text-plum" },
  facebook: { icon: FacebookIcon, hover: "hover:bg-lavender hover:text-plum" },
  email: { icon: Mail, hover: "hover:bg-butter hover:text-plum" },
};

const FOOTER_NAV = {
  categorias: [
    { label: "Cuidado personal", href: "/c/cuidado-personal" },
    { label: "Ojos", href: "/c/ojos" },
    { label: "Labios", href: "/c/labios" },
    { label: "Rostro", href: "/c/rostro" },
    { label: "Cabello", href: "/c/cabello" },
    { label: "Ofertas 🔥", href: "/ofertas", highlight: true },
  ],
  contacto: [
    { label: "Centro de ayuda", href: "/ayuda" },
    { label: "Envíos y entregas", href: "/envios" },
    { label: "Cambios y devoluciones", href: "/devoluciones" },
    { label: "Seguimiento de pedido", href: "/seguimiento" },
    { label: "WhatsApp", href: "https://wa.me/" },
    { label: "hola@beautysale.shop", href: "mailto:hola@beautysale.shop" },
  ],
  nosotros: [
    { label: "Sobre BeautySale", href: "/sobre" },
    { label: "Blog & rituales", href: "/blog" },
    { label: "Trabajá con nosotros", href: "/trabaja-con-nosotros" },
    { label: "Términos y condiciones", href: "/terminos" },
    { label: "Privacidad", href: "/privacidad" },
  ],
};

export async function Footer() {
  const t = await getStorefrontTenantId();
  const [social, { siteName }] = await Promise.all([getSocialLinks(t), getActiveTheme(t)]);
  const activeSocials = SOCIAL_NETWORKS.filter((n) => social[n.key].active && social[n.key].url.trim());

  return (
    <footer className="relative overflow-hidden bg-plum text-cream mt-12">
      <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-pink/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-lavender/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-8">
        <div className="rounded-[28px] bg-cream/5 backdrop-blur border border-cream/10 p-6 md:p-10 mb-12 md:mb-16">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-5xl leading-tight">
                Sumate al <span className="italic text-pink">Glow Squad</span> 💌
              </h2>
              <p className="text-cream/70 mt-2 max-w-md">
                10% off en tu primera compra + tips de belleza, lanzamientos y mimos.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <a href="/" className="font-display text-3xl block">
              {siteName}
            </a>
            <p className="text-sm text-cream/70 max-w-xs">
              Productos de belleza, cuidado personal y accesorios. Hechos con cariño.
            </p>
            {activeSocials.length > 0 && (
              <div className="flex items-center gap-2">
                {activeSocials.map((n) => {
                  const { icon: Icon, hover } = SOCIAL_ICONS[n.key];
                  return (
                    <a
                      key={n.key}
                      href={socialHref(n.key, social[n.key].url)}
                      target={n.key === "email" ? undefined : "_blank"}
                      rel={n.key === "email" ? undefined : "noopener noreferrer"}
                      aria-label={n.label}
                      className={`grid h-10 w-10 place-items-center rounded-full bg-cream/10 ${hover} transition`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {(
            [
              ["Categorías", FOOTER_NAV.categorias],
              ["Contacto", FOOTER_NAV.contacto],
              ["Nosotros", FOOTER_NAV.nosotros],
            ] as const
          ).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display text-lg mb-4">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`text-sm hover:text-pink transition ${
                        "highlight" in item && item.highlight
                          ? "text-pink font-semibold"
                          : "text-cream/70"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-cream/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-cream/60">
            {["Visa", "Mastercard", "PayPal", "Mercado Pago", "Amex"].map((p) => (
              <span
                key={p}
                className="rounded-full bg-cream/10 px-3 py-1.5 font-semibold tracking-wider"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-xs text-cream/50">
            © {new Date().getFullYear()} {siteName}. Hecho con 💖.
          </p>
        </div>
      </div>
    </footer>
  );
}
