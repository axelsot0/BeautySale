-- Theme customization: palette + logo on platform_settings (single row id=1)

alter table public.platform_settings
  add column if not exists theme jsonb,
  add column if not exists logo_url text;

-- theme is null by default => storefront falls back to built-in Bold & Colorful palette.

-- Brand assets bucket (logo). Public read, service_role write.
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

create policy "brand_assets_read" on storage.objects
  for select using (bucket_id = 'brand-assets');
