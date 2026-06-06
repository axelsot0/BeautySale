-- Hero-specific banner fields (only used by slot='hero'). All nullable => Hero uses defaults.
alter table public.banners
  add column if not exists eyebrow_text text,
  add column if not exists eyebrow_color text,
  add column if not exists cta2_label text,
  add column if not exists cta2_link text,
  add column if not exists marquee_text text;
