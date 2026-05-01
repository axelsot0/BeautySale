-- Add image_url to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;

-- Storage bucket for category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read policy
CREATE POLICY "public read category-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

-- Service role upload/delete
CREATE POLICY "service role manage category-images"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'category-images')
  WITH CHECK (bucket_id = 'category-images');
