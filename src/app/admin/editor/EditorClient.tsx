"use client";

import { useRef, useCallback } from "react";
import { RefreshCw, ExternalLink, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { SectionBuilder } from "../sections/SectionBuilder";
import type { NewsletterConfig } from "@/lib/data/theme-query";

type SectionRow = {
  id: string;
  type: string;
  active: boolean;
  config: Record<string, string | undefined>;
};

export function EditorClient({
  sections,
  categories,
  newsletterConfig,
  previewPath = "/store",
}: {
  sections: SectionRow[];
  categories: { slug: string; name: string }[];
  newsletterConfig: NewsletterConfig;
  previewPath?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mobile, setMobile] = useState(false);

  // Recarga la vista previa tras cada cambio guardado.
  const reload = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    // pequeño delay para que la revalidación del server llegue primero
    setTimeout(() => {
      frame.contentWindow?.location.reload();
    }, 600);
  }, []);

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start">
      {/* Panel de edición */}
      <div className="w-full xl:w-[440px] xl:shrink-0 space-y-4">
        <SectionBuilder
          sections={sections}
          categories={categories}
          newsletterConfig={newsletterConfig}
          onChanged={reload}
        />
      </div>

      {/* Vista previa */}
      <div className="w-full xl:flex-1 xl:sticky xl:top-6">
        <div className="rounded-[24px] bg-white border border-plum/10 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-plum/10 bg-plum/[0.03]">
            <p className="text-xs font-bold uppercase tracking-widest text-plum-soft">
              Vista previa
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobile(false)}
                title="Vista escritorio"
                className={`grid h-8 w-8 place-items-center rounded-lg transition ${!mobile ? "bg-pink/10 text-pink" : "hover:bg-plum/5 text-plum/50"}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobile(true)}
                title="Vista móvil"
                className={`grid h-8 w-8 place-items-center rounded-lg transition ${mobile ? "bg-pink/10 text-pink" : "hover:bg-plum/5 text-plum/50"}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
              <button
                onClick={() => iframeRef.current?.contentWindow?.location.reload()}
                title="Recargar"
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-plum/5 text-plum/50 transition"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <a
                href={previewPath}
                target="_blank"
                title="Abrir en pestaña nueva"
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-plum/5 text-plum/50 transition"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className={`bg-plum/5 ${mobile ? "flex justify-center py-4" : ""}`}>
            <iframe
              ref={iframeRef}
              src={previewPath}
              title="Vista previa de la tienda"
              className={`border-0 bg-white transition-all ${
                mobile
                  ? "w-[390px] h-[70vh] rounded-2xl shadow-lg"
                  : "w-full h-[75vh]"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
