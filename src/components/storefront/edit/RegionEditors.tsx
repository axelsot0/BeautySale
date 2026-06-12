"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, Plus, Trash2, Star } from "lucide-react";
import { inlineSave } from "@/app/store/inline-actions";
import { useEditMode, SavedToast } from "./EditMode";

const field =
  "w-full rounded-xl border border-plum/15 bg-cream/40 px-3.5 py-2.5 text-sm text-plum outline-none focus:border-pink focus:bg-white transition";
const label = "text-xs font-bold uppercase tracking-wider text-plum-soft";

type LinkItem = { label: string; href: string; highlight?: boolean };

// ── Scaffolding compartido ───────────────────────────────────────────────────

function useInlineSave(onDone: () => void) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function save(fd: FormData) {
    startTransition(async () => {
      const res = await inlineSave(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setError(null);
      onDone();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }
  return { save, error, saved, pending };
}

function Overlay({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Editar ${title}`}
      className="absolute inset-1 z-30 rounded-2xl outline-dashed outline-2 outline-pink/50 bg-transparent hover:bg-pink/5 hover:outline-pink transition cursor-pointer group/edit"
    >
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-plum text-cream px-3 py-1.5 text-xs font-bold shadow-lg group-hover/edit:bg-pink transition">
        <Pencil className="h-3 w-3" />
        {title}
      </span>
    </button>
  );
}

function Dialog({
  title,
  onClose,
  children,
  onSave,
  pending,
  error,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  onSave: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-plum/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[28px] bg-cream p-6 shadow-[0_32px_80px_rgba(45,27,78,0.35)] space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        {error && <p className="text-sm font-semibold text-pink">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onSave}
            disabled={pending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-pink px-5 py-3 font-bold text-cream hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-plum/15 px-5 py-3 text-sm font-semibold hover:bg-plum/5 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkRows({
  items,
  onChange,
  withHighlight = false,
  addLabel = "Agregar enlace",
}: {
  items: LinkItem[];
  onChange: (items: LinkItem[]) => void;
  withHighlight?: boolean;
  addLabel?: string;
}) {
  function update(i: number, key: keyof LinkItem, value: string | boolean) {
    onChange(items.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <input
            value={item.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="Etiqueta"
            className={`${field} flex-1 min-w-0`}
          />
          <input
            value={item.href}
            onChange={(e) => update(i, "href", e.target.value)}
            placeholder="/ruta o URL"
            className={`${field} flex-1 min-w-0`}
          />
          {withHighlight && (
            <button
              type="button"
              onClick={() => update(i, "highlight", !item.highlight)}
              title="Destacar"
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
                item.highlight ? "bg-pink text-cream" : "border border-plum/15 hover:bg-plum/5"
              }`}
            >
              <Star className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            aria-label="Quitar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-pink/10 hover:text-pink transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { label: "", href: "" }])}
        className="inline-flex items-center gap-1.5 rounded-full border border-plum/20 px-3.5 py-1.5 text-xs font-semibold hover:bg-plum/5 transition"
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}

// ── Header: nombre + menú de navegación ─────────────────────────────────────

export function HeaderEdit({
  siteName,
  navLinks,
  children,
}: {
  siteName: string;
  navLinks: LinkItem[];
  children: ReactNode;
}) {
  const active = useEditMode();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(siteName);
  const [links, setLinks] = useState<LinkItem[]>(navLinks);
  const { save, error, saved, pending } = useInlineSave(() => setOpen(false));

  if (!active) return <>{children}</>;

  function handleSave() {
    const fd = new FormData();
    fd.set("kind", "header");
    fd.set("site_name", name);
    fd.set("nav_links", JSON.stringify(links.filter((l) => l.label.trim() && l.href.trim())));
    save(fd);
  }

  return (
    <div className="relative">
      {children}
      <Overlay title="Encabezado" onClick={() => setOpen(true)} />
      {open && (
        <Dialog title="Encabezado" onClose={() => setOpen(false)} onSave={handleSave} pending={pending} error={error}>
          <label className="block space-y-1">
            <span className={label}>Nombre de la tienda</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </label>
          <div className="space-y-1">
            <span className={label}>Menú de navegación (★ = destacado)</span>
            <LinkRows items={links} onChange={setLinks} withHighlight />
          </div>
        </Dialog>
      )}
      <SavedToast show={saved} />
    </div>
  );
}

// ── NewsBar: textos del ticker ───────────────────────────────────────────────

export function NewsEdit({ items, children }: { items: string[]; children: ReactNode }) {
  const active = useEditMode();
  const [open, setOpen] = useState(false);
  const [texts, setTexts] = useState<string[]>(items.length > 0 ? items : [""]);
  const { save, error, saved, pending } = useInlineSave(() => setOpen(false));

  if (!active) return <>{children}</>;

  function handleSave() {
    const fd = new FormData();
    fd.set("kind", "news");
    fd.set("items", JSON.stringify(texts.map((t) => t.trim()).filter(Boolean)));
    save(fd);
  }

  return (
    <div className="relative">
      {items.length === 0 ? (
        <div className="bg-plum/80 text-cream/60 py-2.5 text-center text-sm">
          Barra de noticias vacía
        </div>
      ) : (
        children
      )}
      <Overlay title="Barra de noticias" onClick={() => setOpen(true)} />
      {open && (
        <Dialog title="Barra de noticias" onClose={() => setOpen(false)} onSave={handleSave} pending={pending} error={error}>
          <div className="space-y-2">
            {texts.map((t, i) => (
              <div key={i} className="flex gap-1.5 items-center">
                <input
                  value={t}
                  onChange={(e) => setTexts((p) => p.map((x, idx) => (idx === i ? e.target.value : x)))}
                  placeholder="Ej: Envío gratis desde $50 🚚"
                  className={`${field} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => setTexts((p) => p.filter((_, idx) => idx !== i))}
                  aria-label="Quitar"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-pink/10 hover:text-pink transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTexts((p) => [...p, ""])}
              className="inline-flex items-center gap-1.5 rounded-full border border-plum/20 px-3.5 py-1.5 text-xs font-semibold hover:bg-plum/5 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar mensaje
            </button>
          </div>
        </Dialog>
      )}
      <SavedToast show={saved} />
    </div>
  );
}

// ── Footer: newsletter + descripción + columnas + pagos ─────────────────────

export function FooterEdit({
  description,
  contact,
  nosotros,
  payments,
  newsletterTitle,
  newsletterSubtitle,
  children,
}: {
  description: string;
  contact: LinkItem[];
  nosotros: LinkItem[];
  payments: string[];
  newsletterTitle: string;
  newsletterSubtitle: string;
  children: ReactNode;
}) {
  const active = useEditMode();
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState(description);
  const [contactL, setContactL] = useState<LinkItem[]>(contact);
  const [nosotrosL, setNosotrosL] = useState<LinkItem[]>(nosotros);
  const [pays, setPays] = useState(payments.join(", "));
  const [nlTitle, setNlTitle] = useState(newsletterTitle);
  const [nlSubtitle, setNlSubtitle] = useState(newsletterSubtitle);
  const { save, error, saved, pending } = useInlineSave(() => setOpen(false));

  if (!active) return <>{children}</>;

  function handleSave() {
    const fd = new FormData();
    fd.set("kind", "footer");
    fd.set("description", desc);
    fd.set("contact", JSON.stringify(contactL.filter((l) => l.label.trim() && l.href.trim())));
    fd.set("nosotros", JSON.stringify(nosotrosL.filter((l) => l.label.trim() && l.href.trim())));
    fd.set("payments", pays);
    fd.set("newsletter_title", nlTitle);
    fd.set("newsletter_subtitle", nlSubtitle);
    save(fd);
  }

  return (
    <div className="relative">
      {children}
      <Overlay title="Footer" onClick={() => setOpen(true)} />
      {open && (
        <Dialog title="Footer" onClose={() => setOpen(false)} onSave={handleSave} pending={pending} error={error}>
          <div className="space-y-1">
            <span className={label}>Newsletter — título</span>
            <input value={nlTitle} onChange={(e) => setNlTitle(e.target.value)} className={field} />
          </div>
          <div className="space-y-1">
            <span className={label}>Newsletter — subtítulo</span>
            <textarea value={nlSubtitle} onChange={(e) => setNlSubtitle(e.target.value)} rows={2} className={field} />
          </div>
          <div className="space-y-1">
            <span className={label}>Descripción de la tienda</span>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className={field} />
          </div>
          <div className="space-y-1">
            <span className={label}>Columna Contacto</span>
            <LinkRows items={contactL} onChange={setContactL} />
          </div>
          <div className="space-y-1">
            <span className={label}>Columna Nosotros</span>
            <LinkRows items={nosotrosL} onChange={setNosotrosL} />
          </div>
          <label className="block space-y-1">
            <span className={label}>Métodos de pago (separados por coma)</span>
            <input
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              placeholder="Visa, Mastercard, PayPal"
              className={field}
            />
          </label>
        </Dialog>
      )}
      <SavedToast show={saved} />
    </div>
  );
}
