"use client";

import { useState, useTransition } from "react";
import { Loader2, ArrowRight, Check, Store, Tag, Package, Image as ImageIcon, PartyPopper } from "lucide-react";
import {
  saveStoreBasics, createFirstCategory, createFirstProduct, saveWelcomeHero,
  type StepState,
} from "./actions";

const field = "w-full rounded-xl border border-plum/15 px-4 py-3 outline-none focus:border-pink";
const label = "block text-xs font-semibold text-plum-soft uppercase tracking-wider mb-1.5";

type StepDef = {
  icon: typeof Store;
  title: string;
  desc: string;
  action: (prev: StepState, fd: FormData) => Promise<StepState>;
  fields: React.ReactNode;
};

export function WelcomeWizard({ initialName }: { initialName: string }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const STEPS: StepDef[] = [
    {
      icon: Store,
      title: "Nombre de tu tienda",
      desc: "Así te van a ver tus clientes. Lo podés cambiar cuando quieras.",
      action: saveStoreBasics,
      fields: (
        <div>
          <label className={label}>Nombre</label>
          <input name="site_name" required maxLength={60} defaultValue={initialName} className={field} />
        </div>
      ),
    },
    {
      icon: Tag,
      title: "Tu primera categoría",
      desc: "Las categorías organizan tu catálogo. Ej.: Skincare, Labios, Accesorios.",
      action: createFirstCategory,
      fields: (
        <div>
          <label className={label}>Nombre de la categoría</label>
          <input name="name" required maxLength={80} placeholder="Skincare" className={field} />
        </div>
      ),
    },
    {
      icon: Package,
      title: "Tu primer producto",
      desc: "Cargá uno para ver tu tienda con vida. Después le agregás fotos y descripción.",
      action: createFirstProduct,
      fields: (
        <div className="space-y-3">
          <div>
            <label className={label}>Nombre del producto</label>
            <input name="title" required maxLength={160} placeholder="Sérum facial glow" className={field} />
          </div>
          <div>
            <label className={label}>Precio (USD)</label>
            <input name="price" required type="number" step="0.01" min="0.01" placeholder="19.99" className={field} />
          </div>
        </div>
      ),
    },
    {
      icon: ImageIcon,
      title: "Tu portada",
      desc: "El mensaje grande que recibe a tus visitantes. La foto la subís después en Banners.",
      action: saveWelcomeHero,
      fields: (
        <div className="space-y-3">
          <div>
            <label className={label}>Título</label>
            <input name="title" required maxLength={120} placeholder="Belleza que se nota" className={field} />
          </div>
          <div>
            <label className={label}>Subtítulo (opcional)</label>
            <input name="subtitle" maxLength={200} placeholder="Envíos a todo el país" className={field} />
          </div>
        </div>
      ),
    },
  ];

  const done = step >= STEPS.length;

  function advance() {
    setError(null);
    setStep((s) => s + 1);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const current = STEPS[step];
    setError(null);
    start(async () => {
      const result = await current.action({}, fd);
      if (result.error) setError(result.error);
      else advance();
    });
  }

  if (done) {
    return (
      <div className="text-center space-y-5 py-8">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint/20">
          <PartyPopper className="h-9 w-9 text-mint" />
        </div>
        <h2 className="font-display text-3xl">Tu tienda está lista</h2>
        <p className="text-plum-soft max-w-sm mx-auto">
          Ya tenés lo básico. Seguí cargando productos, fotos y colores desde el panel.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/admin" className="rounded-full bg-pink px-7 py-3 font-bold text-cream hover:opacity-90 transition">
            Ir al panel
          </a>
          <a href="/store" target="_blank" className="rounded-full border border-plum/15 px-7 py-3 font-semibold hover:bg-plum/5 transition">
            Ver mi tienda
          </a>
        </div>
      </div>
    );
  }

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className={`h-1.5 flex-1 rounded-full transition ${
              i < step ? "bg-mint" : i === step ? "bg-pink" : "bg-plum/10"
            }`}
          />
        ))}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-plum-soft">
        Paso {step + 1} de {STEPS.length}
      </p>

      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-pink/10 shrink-0">
          <Icon className="h-6 w-6 text-pink" />
        </div>
        <div>
          <h2 className="font-display text-2xl">{current.title}</h2>
          <p className="text-sm text-plum-soft mt-1">{current.desc}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {current.fields}
        {error && (
          <p className="rounded-xl bg-pink/10 border border-pink/20 px-3 py-2 text-sm text-pink font-medium">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={advance}
            disabled={pending}
            className="text-sm font-semibold text-plum-soft hover:text-plum transition"
          >
            Saltar este paso
          </button>
          <button
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-pink px-7 py-3 font-bold text-cream hover:opacity-90 disabled:opacity-60 transition"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : step === STEPS.length - 1 ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {step === STEPS.length - 1 ? "Terminar" : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}
