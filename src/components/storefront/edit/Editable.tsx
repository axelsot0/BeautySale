"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X } from "lucide-react";
import { inlineSave } from "@/app/store/inline-actions";
import { useEditMode, SavedToast } from "./EditMode";

export type EditableField = {
  name: string;
  label: string;
  value: string;
  type?: "text" | "textarea" | "color";
};

const field =
  "w-full rounded-xl border border-plum/15 bg-cream/40 px-3.5 py-2.5 text-sm text-plum outline-none focus:border-pink focus:bg-white transition";

// Envuelve un bloque del storefront. Fuera del modo edición renderiza los
// children tal cual; en modo edición superpone un overlay clickeable que
// abre un dialog con los campos y guarda vía inlineSave.
export function Editable({
  title,
  kind,
  id,
  fields,
  children,
}: {
  title: string;
  kind: "hero" | "section" | "editorial" | "newsletter";
  id?: string;
  fields: EditableField[];
  children: ReactNode;
}) {
  const active = useEditMode();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.value])),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!active) return <>{children}</>;

  function save() {
    const fd = new FormData();
    fd.set("kind", kind);
    if (id) fd.set("id", id);
    for (const [k, v] of Object.entries(values)) fd.set(k, v);
    startTransition(async () => {
      const res = await inlineSave(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setError(null);
      setOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      {children}

      {/* Overlay clickeable */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Editar ${title}`}
        className="absolute inset-2 z-30 rounded-[28px] outline-dashed outline-2 outline-pink/50 bg-transparent hover:bg-pink/5 hover:outline-pink transition cursor-pointer group/edit"
      >
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-plum text-cream px-3 py-1.5 text-xs font-bold shadow-lg group-hover/edit:bg-pink transition">
          <Pencil className="h-3 w-3" />
          {title}
        </span>
      </button>

      {/* Dialog de edición */}
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-plum/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-[28px] bg-cream p-6 shadow-[0_32px_80px_rgba(45,27,78,0.35)] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl">{title}</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-plum/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {fields.map((f) => (
              <label key={f.name} className="block space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-plum-soft">
                  {f.label}
                </span>
                {f.type === "textarea" ? (
                  <textarea
                    value={values[f.name]}
                    onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
                    rows={3}
                    className={field}
                  />
                ) : f.type === "color" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={values[f.name] || "#FF4D8B"}
                      onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
                      className="h-10 w-14 rounded-lg border border-plum/15 cursor-pointer"
                    />
                    <input
                      value={values[f.name]}
                      onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
                      className={field}
                    />
                  </div>
                ) : (
                  <input
                    value={values[f.name]}
                    onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
                    className={field}
                  />
                )}
              </label>
            ))}

            {error && <p className="text-sm font-semibold text-pink">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                disabled={pending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-pink px-5 py-3 font-bold text-cream hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-plum/15 px-5 py-3 text-sm font-semibold hover:bg-plum/5 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <SavedToast show={saved} />
    </div>
  );
}
