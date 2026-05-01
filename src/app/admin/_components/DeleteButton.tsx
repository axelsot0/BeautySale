"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteButton({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Eliminar"
        className="grid h-9 w-9 place-items-center rounded-full hover:bg-pink/10 text-plum hover:text-pink"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title={label ? `Eliminar ${label}` : "Confirmar"}
        className="rounded-full bg-pink px-3 py-1.5 text-xs font-bold text-cream"
      >
        Sí, borrar
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-full bg-plum/5 px-3 py-1.5 text-xs font-medium"
      >
        Cancel
      </button>
    </form>
  );
}
