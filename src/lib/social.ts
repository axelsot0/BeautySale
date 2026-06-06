// Footer social links config. Admin toggles which networks show and sets their URL.
// Shared by the Footer (render) and the admin form (edit).

export type SocialLink = { active: boolean; url: string };

export const SOCIAL_NETWORKS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tuusuario" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@tuusuario" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/18095551234" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/tupagina" },
  { key: "email", label: "Email", placeholder: "hola@tudominio.com" },
] as const;

export type SocialKey = (typeof SOCIAL_NETWORKS)[number]["key"];
export type SocialLinks = Record<SocialKey, SocialLink>;

export const DEFAULT_SOCIAL: SocialLinks = SOCIAL_NETWORKS.reduce((acc, n) => {
  acc[n.key] = { active: false, url: "" };
  return acc;
}, {} as SocialLinks);

// Coerce arbitrary jsonb into a valid SocialLinks map (missing keys default to inactive).
export function parseSocialLinks(raw: unknown): SocialLinks {
  const out: SocialLinks = { ...DEFAULT_SOCIAL };
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    for (const n of SOCIAL_NETWORKS) {
      const v = r[n.key];
      if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        out[n.key] = {
          active: o.active === true,
          url: typeof o.url === "string" ? o.url : "",
        };
      }
    }
  }
  return out;
}

// Build the href for a network (email -> mailto:, others use the URL as-is).
export function socialHref(key: SocialKey, url: string): string {
  const u = url.trim();
  if (key === "email") return u.startsWith("mailto:") ? u : `mailto:${u}`;
  return u;
}
