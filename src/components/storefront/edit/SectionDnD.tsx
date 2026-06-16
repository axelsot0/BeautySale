"use client";

import { Children, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2, Move } from "lucide-react";
import { inlineReorderSections } from "@/app/store/inline-actions";
import { useEditMode, SavedToast } from "./EditMode";

type SectionMeta = { id: string; label: string };

// Reordenamiento drag & drop de las secciones del home en modo edición.
// Al agarrar una sección aparece un minimapa flotante con frames chicos
// (con la posición como marca de agua) sobre el que se reordena sin scroll.
export function SectionDnD({ sections, children }: { sections: SectionMeta[]; children: ReactNode }) {
  const active = useEditMode();
  const ids = sections.map((s) => s.id);
  const labelById = new Map(sections.map((s) => [s.id, s.label]));
  const kids = Children.toArray(children);
  const [order, setOrder] = useState<string[]>(ids);
  const dragId = useRef<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Tras guardar + refresh el server manda el orden nuevo: re-sincronizar.
  useEffect(() => {
    setOrder(ids);
  }, [ids.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return <>{children}</>;

  const byId = new Map(ids.map((id, i) => [id, kids[i]]));

  function reorder(overId: string) {
    const from = dragId.current;
    if (!from || from === overId) return;
    setOrder((prev) => {
      const next = prev.filter((x) => x !== from);
      const at = next.indexOf(overId);
      next.splice(at < 0 ? next.length : at, 0, from);
      return next;
    });
  }

  function onDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    reorder(overId);
  }

  function startDrag(e: React.DragEvent, id: string) {
    dragId.current = id;
    setDragging(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop() {
    if (dragId.current === null) return; // ya procesado por otro handler del mismo drag
    const finalOrder = order;
    dragId.current = null;
    setDragging(null);
    startTransition(async () => {
      const res = await inlineReorderSections(finalOrder);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  }

  return (
    <>
      {order.map((id) => (
        <div
          key={id}
          draggable
          onDragStart={(e) => startDrag(e, id)}
          onDragOver={(e) => onDragOver(e, id)}
          onDrop={onDrop}
          onDragEnd={onDrop}
          className={`relative transition-opacity ${dragging === id ? "opacity-40" : ""}`}
        >
          {/* Handle visual */}
          <span className="absolute right-3 top-3 z-40 inline-flex items-center gap-1 rounded-full bg-cream text-plum border border-plum/15 px-2.5 py-1.5 text-xs font-bold shadow-md cursor-grab active:cursor-grabbing select-none">
            <GripVertical className="h-3.5 w-3.5" />
            Mover
          </span>
          {byId.get(id)}
        </div>
      ))}

      {/* Minimapa: aparece mientras se arrastra. Frames chicos = vista de todas
          las secciones sin scroll; se reordena soltando sobre una posición. */}
      {dragging && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-plum/55 backdrop-blur-sm pointer-events-none" />
          <div
            className="relative w-[min(92vw,440px)] max-h-[82vh] overflow-y-auto rounded-[28px] bg-cream border border-plum/10 shadow-[0_24px_64px_rgba(45,27,78,0.4)] p-5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <div className="flex items-center gap-2">
              <Move className="h-5 w-5 text-pink" />
              <h3 className="font-display text-xl">Reordenar secciones</h3>
            </div>
            <p className="text-xs text-plum-soft mt-1 mb-4">
              Arrastrá sobre una posición y soltá para mover. Se guarda solo.
            </p>
            <div className="space-y-2">
              {order.map((id, i) => (
                <div
                  key={id}
                  draggable
                  onDragStart={(e) => startDrag(e, id)}
                  onDragOver={(e) => onDragOver(e, id)}
                  onDrop={onDrop}
                  onDragEnd={onDrop}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 cursor-grab active:cursor-grabbing select-none transition ${
                    dragging === id
                      ? "border-pink bg-pink/5 ring-2 ring-pink"
                      : "border-plum/10 bg-white hover:border-plum/30"
                  }`}
                >
                  {/* Marca de agua: número de posición */}
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-display text-5xl leading-none text-plum/10 select-none">
                    {i + 1}
                  </span>
                  <GripVertical className="h-4 w-4 text-plum-soft shrink-0" />
                  <span className="font-semibold text-plum truncate">{labelById.get(id)}</span>
                  {dragging === id && (
                    <span className="ml-auto mr-9 text-[10px] font-bold uppercase tracking-widest text-pink">
                      moviendo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {pending && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 rounded-full bg-plum text-cream px-5 py-2.5 text-sm font-bold shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" /> Guardando orden
        </div>
      )}
      <SavedToast show={saved} />
    </>
  );
}
