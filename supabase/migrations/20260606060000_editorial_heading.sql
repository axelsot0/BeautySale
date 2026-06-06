-- Editable heading for the editorials (Mosaic) section. Null => built-in defaults.
alter table public.platform_settings
  add column if not exists editorial_eyebrow text,
  add column if not exists editorial_title text;
