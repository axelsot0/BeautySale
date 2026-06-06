-- Optional call-to-action label for banners (used by the hero banner button).
alter table public.banners
  add column if not exists cta_label text;
