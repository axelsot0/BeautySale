"use client";

import { useActionState } from "react";
import { Check, Loader2, Type, Share2 } from "lucide-react";
import { saveSiteName, saveSocialLinks, type ThemeState } from "@/app/admin/theme/actions";
import { SOCIAL_NETWORKS, type SocialLinks } from "@/lib/social";

const INITIAL: ThemeState = {};
const field = "w-full rounded-xl border border-plum/15 px-3 py-2 text-sm outline-none focus:border-pink";

export function SiteSettingsForm({ siteName, social }: { siteName: string; social: SocialLinks }) {
  const [nameState, nameAction, savingName] = useActionState(saveSiteName, INITIAL);
  const [socialState, socialAction, savingSocial] = useActionState(saveSocialLinks, INITIAL);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-plum/10 bg-white p-6 space-y-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Type className="h-5 w-5 text-pink" /> Nombre de la tienda
        </h2>
        <form action={nameAction} className="flex flex-wrap items-end gap-3">
          <input
            name="site_name"
            defaultValue={siteName}
            maxLength={40}
            placeholder="Mi tienda"
            className={`${field} flex-1 min-w-[220px] font-display text-lg`}
          />
          <button
            disabled={savingName}
            className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
          >
            {savingName && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
          </button>
          {nameState.ok && <span className="text-sm text-mint flex items-center gap-1"><Check className="h-4 w-4" />ok</span>}
          {nameState.error && <span className="text-sm text-pink">{nameState.error}</span>}
        </form>
      </section>

      <section className="rounded-3xl border border-plum/10 bg-white p-6 space-y-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Share2 className="h-5 w-5 text-pink" /> Redes (footer)
        </h2>
        <p className="text-sm text-plum-soft">Solo las activas con URL aparecen en el footer.</p>
        <form action={socialAction} className="space-y-3">
          {SOCIAL_NETWORKS.map((n) => (
            <div key={n.key} className="flex flex-wrap items-center gap-3 rounded-2xl border border-plum/10 p-3">
              <label className="flex items-center gap-2 w-28 shrink-0">
                <input type="checkbox" name={`${n.key}_active`} defaultChecked={social[n.key].active} className="h-5 w-5 accent-pink" />
                <span className="font-bold text-plum text-sm">{n.label}</span>
              </label>
              <input
                name={`${n.key}_url`}
                defaultValue={social[n.key].url}
                placeholder={n.placeholder}
                maxLength={300}
                className={`${field} flex-1 min-w-[200px]`}
              />
            </div>
          ))}
          <button
            disabled={savingSocial}
            className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50 transition"
          >
            {savingSocial && <Loader2 className="h-4 w-4 animate-spin" />} Guardar redes
          </button>
          {socialState.ok && <span className="ml-2 text-sm text-mint">Guardado</span>}
          {socialState.error && <span className="ml-2 text-sm text-pink">{socialState.error}</span>}
        </form>
      </section>
    </div>
  );
}
