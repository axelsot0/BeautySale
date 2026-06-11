import { Check, Store } from "lucide-react";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

const PERKS = [
  "Tu catálogo de productos y categorías",
  "Pedidos con cobro por WhatsApp",
  "Hero y nombre personalizables",
  "15 días para probarla sin costo",
];

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-cream text-plum grid lg:grid-cols-2">
      {/* Left: pitch */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-plum text-cream p-12">
        <div className="absolute -top-24 -right-16 h-80 w-80 rounded-full bg-pink/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-lavender/20 blur-3xl" />
        <a href="/" className="relative font-display text-2xl">
          Beauty<span className="text-pink italic">Sale</span>
        </a>
        <div className="relative space-y-6">
          <h2 className="font-display text-4xl leading-tight">
            Tu tienda lista <span className="italic text-pink">hoy</span>
          </h2>
          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-cream/85">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-mint/20 shrink-0">
                  <Check className="h-3.5 w-3.5 text-mint" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <a href="/t/beautysale" className="relative inline-flex items-center gap-2 text-sm text-cream/70 hover:text-pink transition">
          <Store className="h-4 w-4" /> Ver una tienda de ejemplo
        </a>
      </div>

      {/* Right: form */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-16">
        <div className="w-full max-w-sm mx-auto">
          <a href="/" className="lg:hidden font-display text-2xl block mb-8">
            Beauty<span className="text-pink italic">Sale</span>
          </a>
          <h1 className="font-display text-3xl">Creá tu tienda</h1>
          <p className="text-plum-soft text-sm mt-1 mb-8">
            Empezá en modo demo. Sin tarjeta de crédito.
          </p>

          <SignupForm />

          <p className="text-sm text-center text-plum-soft mt-6">
            ¿Ya tenés tienda?{" "}
            <a href="/admin/login" className="font-semibold text-pink hover:underline">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
