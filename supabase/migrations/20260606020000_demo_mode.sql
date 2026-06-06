-- Demo mode: when true, the storefront shows built-in sample data (news, products,
-- editorials, flash sale, brands) wherever the admin hasn't created real content yet.
-- Default true so existing installs keep the current look until the admin opts out.
alter table public.platform_settings
  add column if not exists demo_mode boolean not null default true;
