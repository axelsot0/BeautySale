-- Payment hardening: capture reconciliation and idempotency.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS paypal_capture_currency TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_paypal_capture_id_uniq
  ON public.orders (paypal_capture_id)
  WHERE paypal_capture_id IS NOT NULL;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','paid','cancelled','refunded','shipped','delivered','declined','failed'));

ALTER TABLE public.subscription_payments
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS subscription_payments_paypal_order_id_uniq
  ON public.subscription_payments (paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscription_payments_paypal_capture_id_uniq
  ON public.subscription_payments (paypal_capture_id)
  WHERE paypal_capture_id IS NOT NULL;

-- Match server-side upload policy: public read, service_role writes, raster images only.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
WHERE id = 'section-images';
