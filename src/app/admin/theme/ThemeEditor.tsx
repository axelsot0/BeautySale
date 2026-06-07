"use client";

import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import { Check, Upload, Trash2, Loader2, RotateCcw, Palette as PaletteIcon, FlaskConical } from "lucide-react";
import {
  PRESETS,
  CORE_TOKENS,
  DEFAULT_PALETTE,
  paletteFromCore,
  paletteToCssVars,
  isHex,
  type Palette,
  type CoreToken,
} from "@/lib/theme";
import {
  saveTheme,
  resetTheme,
  saveLogo,
  removeLogo,
  saveDemoMode,
  type ThemeState,
} from "./actions";

const INITIAL: ThemeState = {};

function coresFromPalette(p: Palette): Record<CoreToken, string> {
  return { pink: p.pink, lavender: p.lavender, butter: p.butter, mint: p.mint, cream: p.cream, plum: p.plum };
}

export function ThemeEditor({
  current,
  isDefault,
  logoUrl,
  demoMode,
  isDeveloper = false,
}: {
  current: Palette;
  isDefault: boolean;
  logoUrl: string | null;
  demoMode: boolean;
  isDeveloper?: boolean;
}) {
  const [cores, setCores] = useState<Record<CoreToken, string>>(coresFromPalette(current));
  const [presetId, setPresetId] = useState<string | null>(null);

  const activePalette: Palette = useMemo(() => {
    if (presetId) {
      const p = PRESETS.find((x) => x.id === presetId);
      if (p) return p.palette;
    }
    return paletteFromCore(cores);
  }, [presetId, cores]);

  const [saveState, saveAction, saving] = useActionState(saveTheme, INITIAL);
  const [resetting, startReset] = useTransition();

  function pickPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setCores(coresFromPalette(p.palette)); // keep cores in sync for custom tweaking
  }

  function editCore(key: CoreToken, value: string) {
    setPresetId(null); // tweaking switches to custom
    setCores((c) => ({ ...c, [key]: value }));
  }

  const previewVars = paletteToCssVars(activePalette) as React.CSSProperties;

  return (
    <div className="space-y-8">
      {/* ===== Demo mode (developer only) ===== */}
      {isDeveloper && <DemoSection demoMode={demoMode} />}

      {/* ===== Presets ===== */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <PaletteIcon className="h-5 w-5 text-pink" /> Paletas
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESETS.map((p) => {
            const active = presetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => pickPreset(p.id)}
                className={`text-left rounded-[20px] border p-4 transition ${
                  active ? "border-pink ring-2 ring-pink" : "border-plum/10 hover:border-plum/30"
                }`}
                style={{ background: p.palette.cream }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-lg" style={{ color: p.palette.plum }}>
                    {p.name}
                  </span>
                  {active && <Check className="h-4 w-4 text-pink" />}
                </div>
                <div className="flex gap-1.5 mb-2">
                  {[p.palette.pink, p.palette.lavender, p.palette.butter, p.palette.mint, p.palette.plum].map(
                    (c, i) => (
                      <span key={i} className="h-7 w-7 rounded-full ring-1 ring-black/5" style={{ background: c }} />
                    ),
                  )}
                </div>
                <p className="text-xs" style={{ color: p.palette.plumSoft }}>
                  {p.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== Custom creator ===== */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Crear paleta propia</h2>
        <p className="text-sm text-plum-soft">
          Elige los 6 colores base. Los tonos suaves se generan automáticamente.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CORE_TOKENS.map((t) => {
            const val = cores[t.key];
            const valid = isHex(val);
            return (
              <label key={t.key} className="rounded-2xl border border-plum/10 p-3 flex items-center gap-3">
                <input
                  type="color"
                  value={valid ? (val.startsWith("#") ? val : `#${val}`) : "#000000"}
                  onChange={(e) => editCore(t.key, e.target.value)}
                  className="h-10 w-10 rounded-lg border border-plum/10 bg-transparent cursor-pointer shrink-0"
                  aria-label={t.label}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-plum-soft">{t.label}</p>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => editCore(t.key, e.target.value)}
                    spellCheck={false}
                    className={`w-full bg-transparent font-mono text-sm outline-none ${
                      valid ? "text-plum" : "text-pink"
                    }`}
                  />
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* ===== Live preview ===== */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Vista previa</h2>
        <div
          className="rounded-[24px] p-6 border border-plum/10"
          style={{ ...previewVars, background: "var(--color-cream)" }}
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-display text-2xl" style={{ color: "var(--color-plum)" }}>
              Beauty<span style={{ color: "var(--color-pink)", fontStyle: "italic" }}>Sale</span>
            </span>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: "var(--color-butter)", color: "var(--color-plum)" }}
            >
              Oferta
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: "var(--color-pink)", color: "var(--color-cream)" }}>
              Comprar
            </span>
            <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: "var(--color-lavender)", color: "var(--color-cream)" }}>
              Categorías
            </span>
            <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: "var(--color-mint)", color: "var(--color-plum)" }}>
              Novedades
            </span>
          </div>
        </div>

        {saveState.error && <p className="text-sm text-pink font-medium">{saveState.error}</p>}
        {saveState.ok && <p className="text-sm text-mint font-medium">Paleta guardada y publicada.</p>}

        <div className="flex flex-wrap gap-3">
          <form action={saveAction}>
            <input type="hidden" name="palette" value={JSON.stringify(activePalette)} />
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-pink px-6 py-3 font-bold text-cream transition hover:shadow-glow-pink disabled:opacity-60 inline-flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Publicando…" : "Guardar y publicar"}
            </button>
          </form>

          <button
            type="button"
            disabled={resetting || isDefault}
            onClick={() =>
              startReset(async () => {
                await resetTheme();
                setCores(coresFromPalette(DEFAULT_PALETTE));
                setPresetId(null);
              })
            }
            className="rounded-full bg-plum/8 px-6 py-3 font-bold text-plum transition hover:bg-plum/15 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {isDefault ? "Ya usas la paleta por defecto" : "Restaurar por defecto"}
          </button>
        </div>
      </section>

      {/* ===== Logo ===== */}
      <LogoSection logoUrl={logoUrl} />
    </div>
  );
}

function DemoSection({ demoMode }: { demoMode: boolean }) {
  const [saveState, saveAction, saving] = useActionState(saveDemoMode, INITIAL);

  return (
    <section className="rounded-[24px] border border-plum/10 bg-white p-5 space-y-3">
      <h2 className="font-display text-2xl flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-pink" /> Modo demo
      </h2>
      <p className="text-sm text-plum-soft">
        Con el modo demo activo, la tienda muestra datos de ejemplo (novedades, productos,
        editoriales, flash sale, marcas) donde aún no hayas cargado contenido real. Desactívalo para
        mostrar solo tus datos.
      </p>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            demoMode ? "bg-butter text-plum" : "bg-plum/10 text-plum-soft"
          }`}
        >
          {demoMode ? "Activo" : "Desactivado"}
        </span>
        <form action={saveAction}>
          <input type="hidden" name="demo_mode" value={(!demoMode).toString()} />
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-plum/8 px-5 py-2.5 font-bold text-plum transition hover:bg-plum/15 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {demoMode ? "Desactivar datos demo" : "Activar datos demo"}
          </button>
        </form>
      </div>
      {saveState.error && <p className="text-sm text-pink font-medium">{saveState.error}</p>}
      {saveState.ok && <p className="text-sm text-mint font-medium">Modo demo actualizado.</p>}
    </section>
  );
}

function LogoSection({ logoUrl }: { logoUrl: string | null }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const [saveState, saveAction, saving] = useActionState(saveLogo, INITIAL);
  const [removing, startRemove] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setProcessing(true);
    setProcessedUrl(null);
    try {
      // Load @imgly/background-removal at runtime from CDN (no npm dependency).
      const cdnUrl = "https://esm.sh/@imgly/background-removal@1.7.0";
      const mod = await import(
        /* webpackIgnore: true */
        /* turbopackIgnore: true */
        cdnUrl
      );
      const removeBackground = mod.removeBackground ?? mod.default?.removeBackground ?? mod.default;
      const blob: Blob = await removeBackground(file);
      // Keep dimensions: bg removal returns same-size PNG with alpha.
      const pngFile = new File([blob], "logo.png", { type: "image/png" });
      fileRef.current = pngFile;
      setProcessedUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(
        err instanceof Error ? `No se pudo recortar el fondo: ${err.message}` : "Error procesando la imagen",
      );
    } finally {
      setProcessing(false);
    }
  }

  function submit(formData: FormData) {
    if (!fileRef.current) {
      setError("Primero sube y procesa una imagen.");
      return;
    }
    formData.set("logo", fileRef.current);
    saveAction(formData);
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl">Logo</h2>
      <p className="text-sm text-plum-soft">
        Sube tu logo (PNG/JPG). Recortamos el fondo automáticamente en tu navegador y mantenemos las
        proporciones originales.
      </p>

      <div className="flex flex-wrap items-start gap-4">
        {/* Current / preview */}
        <div className="rounded-2xl border border-plum/10 bg-[conic-gradient(#0001_90deg,transparent_90deg_180deg,#0001_180deg_270deg,transparent_270deg)] bg-[length:16px_16px] p-4 grid place-items-center min-h-[120px] min-w-[160px]">
          {processedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={processedUrl} alt="Logo procesado" className="max-h-24 object-contain" />
          ) : logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo actual" className="max-h-24 object-contain" />
          ) : (
            <span className="text-xs text-plum-soft">Sin logo</span>
          )}
        </div>

        <div className="space-y-3 flex-1 min-w-[240px]">
          <label className="inline-flex items-center gap-2 rounded-full bg-plum/8 px-5 py-2.5 font-bold text-plum cursor-pointer hover:bg-plum/15 transition">
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {processing ? "Recortando fondo…" : "Elegir imagen"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={processing} />
          </label>

          {error && <p className="text-sm text-pink font-medium">{error}</p>}
          {saveState.error && <p className="text-sm text-pink font-medium">{saveState.error}</p>}
          {saveState.ok && <p className="text-sm text-mint font-medium">Logo publicado.</p>}

          <div className="flex flex-wrap gap-2">
            <form ref={formRef} action={submit}>
              <button
                type="submit"
                disabled={saving || processing || !processedUrl}
                className="rounded-full bg-pink px-5 py-2.5 font-bold text-cream transition hover:shadow-glow-pink disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Publicando…" : "Publicar logo"}
              </button>
            </form>

            {logoUrl && (
              <button
                type="button"
                disabled={removing}
                onClick={() => startRemove(async () => { await removeLogo(); })}
                className="rounded-full bg-plum/8 px-5 py-2.5 font-bold text-plum transition hover:bg-plum/15 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Quitar logo
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
