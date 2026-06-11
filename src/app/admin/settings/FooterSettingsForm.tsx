"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, Check } from "lucide-react";
import { saveFooterConfig, type SettingsState } from "./actions";
import type { FooterConfig } from "@/lib/data/theme-query";

const inputCls = "rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink";
const INITIAL: SettingsState = {};

type Link = { label: string; href: string };

function LinkListEditor({
  items,
  onChange,
}: {
  items: Link[];
  onChange: (next: Link[]) => void;
}) {
  function add() {
    onChange([...items, { label: "", href: "" }]);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function update(i: number, key: keyof Link, value: string) {
    onChange(items.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center flex-wrap">
          <input
            value={item.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="Etiqueta"
            className={`${inputCls} flex-1 min-w-[140px]`}
          />
          <input
            value={item.href}
            onChange={(e) => update(i, "href", e.target.value)}
            placeholder="/ruta o https://..."
            className={`${inputCls} flex-1 min-w-[180px]`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-pink/10 hover:text-pink"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-full border border-plum/20 px-4 py-2 text-sm hover:bg-plum/5 transition"
      >
        <Plus className="h-4 w-4" /> Agregar
      </button>
    </div>
  );
}

function PaymentsEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setInput("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((p) => (
          <span
            key={p}
            className="inline-flex items-center gap-1.5 rounded-full bg-plum/10 px-3 py-1 text-sm font-semibold"
          >
            {p}
            <button
              type="button"
              onClick={() => onChange(items.filter((x) => x !== p))}
              className="text-plum/40 hover:text-pink transition text-xs leading-none"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="ej: Visa"
          className={`${inputCls} flex-1 max-w-xs`}
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-full border border-plum/20 px-4 py-2 text-sm hover:bg-plum/5 transition"
        >
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </div>
    </div>
  );
}

export function FooterSettingsForm({ config }: { config: FooterConfig }) {
  const [description, setDescription] = useState(config.description);
  const [contact, setContact] = useState<Link[]>(config.contact);
  const [nosotros, setNosotros] = useState<Link[]>(config.nosotros);
  const [payments, setPayments] = useState<string[]>(config.payments);
  const [state, setState] = useState<SettingsState>(INITIAL);
  const [pending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("footer_description", description);
    fd.set("footer_contact",  JSON.stringify(contact.filter((l) => l.label.trim())));
    fd.set("footer_nosotros", JSON.stringify(nosotros.filter((l) => l.label.trim())));
    fd.set("footer_payments", JSON.stringify(payments.filter(Boolean)));
    startTransition(async () => {
      const result = await saveFooterConfig(INITIAL, fd);
      setState(result);
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Descripción */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold">Descripción de la tienda</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="Productos de belleza, cuidado personal..."
          className={`${inputCls} w-full resize-none`}
        />
      </div>

      {/* Contacto */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold">Columna &quot;Contacto&quot;</label>
        <LinkListEditor items={contact} onChange={setContact} />
      </div>

      {/* Nosotros */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold">Columna &quot;Nosotros&quot;</label>
        <LinkListEditor items={nosotros} onChange={setNosotros} />
      </div>

      {/* Métodos de pago */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold">Métodos de pago mostrados</label>
        <p className="text-xs text-plum-soft">Tags que aparecen en la barra inferior del footer.</p>
        <PaymentsEditor items={payments} onChange={setPayments} />
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <button
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Guardar footer
        </button>
        {state.ok && (
          <span className="text-sm text-mint flex items-center gap-1">
            <Check className="h-4 w-4" /> Guardado
          </span>
        )}
        {state.error && <span className="text-sm text-pink">{state.error}</span>}
      </div>
    </form>
  );
}
