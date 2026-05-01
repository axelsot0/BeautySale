-- Storage buckets for product and banner images.
-- Public read, writes only via service_role (server-side admin).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('banner-images',  'banner-images',  true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

-- Public read policy on both buckets
create policy "public_read_product_images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "public_read_banner_images"
on storage.objects for select
using (bucket_id = 'banner-images');

-- No insert/update/delete policies = service_role only (admin uploads via server actions).
