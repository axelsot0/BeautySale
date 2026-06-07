-- PayPal credentials per platform (single row id=1). Admin-managed via /admin/settings.
-- Null => falls back to env vars (NEXT_PUBLIC_PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_MODE).
alter table public.platform_settings
  add column if not exists paypal_client_id text,
  add column if not exists paypal_secret text,
  add column if not exists paypal_mode text not null default 'sandbox';
