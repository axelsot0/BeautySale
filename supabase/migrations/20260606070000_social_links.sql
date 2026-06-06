-- Footer social links, admin-managed. jsonb map: { instagram: {active,url}, ... }.
-- Null => all networks hidden until the admin configures them.
alter table public.platform_settings
  add column if not exists social_links jsonb;
