"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { LOCALES, LOCALE_LABELS, readClientLocale, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>("es");
  useEffect(() => setLocale(readClientLocale()), []);

  return (
    <div className="relative grid h-10 place-items-center">
      <label className="flex items-center gap-1 cursor-pointer rounded-full px-2 h-10 hover:bg-plum/5 transition">
        <Globe className="h-5 w-5" />
        <span className="text-xs font-bold uppercase">{locale}</span>
        <select
          aria-label="Idioma"
          value={locale}
          onChange={(e) => {
            // /xx setea cookie y redirige de vuelta a esta página
            window.location.href = `/${e.target.value}`;
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
