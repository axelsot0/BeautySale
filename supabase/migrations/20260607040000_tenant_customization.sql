-- Tenant-level customization: nav, footer, newsletter, image storage

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS nav_links         jsonb,
  ADD COLUMN IF NOT EXISTS footer_description text,
  ADD COLUMN IF NOT EXISTS footer_contact    jsonb,
  ADD COLUMN IF NOT EXISTS footer_nosotros   jsonb,
  ADD COLUMN IF NOT EXISTS footer_payments   jsonb,
  ADD COLUMN IF NOT EXISTS newsletter_discount_pct integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS newsletter_title  text,
  ADD COLUMN IF NOT EXISTS newsletter_subtitle text;

-- Public storage bucket for section / banner images (5 MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'section-images',
  'section-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
