-- Customizable platform/site name (single row id=1). Null => default "BeautySale".
alter table public.platform_settings
  add column if not exists site_name text;
