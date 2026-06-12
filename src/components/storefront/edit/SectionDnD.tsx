"use client";

import { Children, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2 } from "lucide-react";
import { inlineReorderSections } from "@/app/store/inline-actions";
import { useEditMode, SavedToast } from "./EditMode";

// Reordenamiento drag & drop de las secciones del home en modo edición.
// Los children server-rendered se reordenan de forma optimista en cliente
// y el nuevo orden se persiste vía inlineReorderSections.
export function SectionDnD({ ids, children }: { ids: string[]; children: ReactNode }) {
  const active = useEditMode();
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

  function onDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    const from = dragId.current;
    if (!from || from === overId) return;
    setOrder((prev) => {
      const next = prev.filter((x) => x !== from);
      next.splice(next.indexOf(overId) < 0 ? next.length : next.indexOf(overId), 0, from);
      return next;
    });
  }

  function onDrop() {
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
          onDragStart={(e) => {
            dragId.current = id;
            setDragging(id);
            e.dataTransfer.effectAllowed = "move";
          }}
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
      {pending && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 rounded-full bg-plum text-cream px-5 py-2.5 text-sm font-bold shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" /> Guardando orden
        </div>
      )}
      <SavedToast show={saved} />
    </>
  );
}
