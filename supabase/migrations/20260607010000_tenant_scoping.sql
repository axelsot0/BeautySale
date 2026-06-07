-- Phase 2: scope all business data by tenant. Additive + backfill to tenant 1.

-- 1. tenant_id on business tables (uuid-keyed).
alter table public.products              add column if not exists tenant_id bigint references public.tenants(id) on delete cascade;
alter table public.categories            add column if not exists tenant_id bigint references public.tenants(id) on delete cascade;
alter table public.banners               add column if not exists tenant_id bigint references public.tenants(id) on delete cascade;
alter table public.news                  add column if not exists tenant_id bigint references public.tenants(id) on delete cascade;
alter table public.orders                add column if not exists tenant_id bigint references public.tenants(id) on delete cascade;
alter table public.brands                add column if not exists tenant_id bigint references public.tenants(id) on delete cascade;
alter table public.newsletter_subscribers add column if not exists tenant_id bigint references public.tenants(id) on delete cascade;

update public.products              set tenant_id = 1 where tenant_id is null;
update public.categories            set tenant_id = 1 where tenant_id is null;
update public.banners               set tenant_id = 1 where tenant_id is null;
update public.news                  set tenant_id = 1 where tenant_id is null;
update public.orders                set tenant_id = 1 where tenant_id is null;
update public.brands                set tenant_id = 1 where tenant_id is null;
update public.newsletter_subscribers set tenant_id = 1 where tenant_id is null;

create index if not exists products_tenant_idx   on public.products(tenant_id);
create index if not exists categories_tenant_idx on public.categories(tenant_id);
create index if not exists banners_tenant_idx    on public.banners(tenant_id);
create index if not exists news_tenant_idx       on public.news(tenant_id);
create index if not exists orders_tenant_idx     on public.orders(tenant_id);
create index if not exists brands_tenant_idx     on public.brands(tenant_id);
create index if not exists newsletter_tenant_idx on public.newsletter_subscribers(tenant_id);

-- slug uniqueness becomes per-tenant (two stores can both have "labiales").
alter table public.categories drop constraint if exists categories_slug_key;
create unique index if not exists categories_tenant_slug_uniq on public.categories(tenant_id, slug);
alter table public.products drop constraint if exists products_slug_key;
create unique index if not exists products_tenant_slug_uniq on public.products(tenant_id, slug);

-- newsletter email/code uniqueness scoped per-tenant.
alter table public.newsletter_subscribers drop constraint if exists newsletter_subscribers_email_key;
create unique index if not exists newsletter_tenant_email_uniq on public.newsletter_subscribers(tenant_id, email);

-- 2. flash_sale: single-row -> one row per tenant.
alter table public.flash_sale drop constraint if exists flash_single_row;
alter table public.flash_sale add column if not exists tenant_id bigint references public.tenants(id) on delete cascade;
update public.flash_sale set tenant_id = 1 where tenant_id is null;
create unique index if not exists flash_sale_tenant_uniq on public.flash_sale(tenant_id);

-- 3. Per-tenant settings columns on tenants (moved from platform_settings).
alter table public.tenants
  add column if not exists paypal_client_id  text,
  add column if not exists paypal_secret     text,
  add column if not exists paypal_mode       text not null default 'sandbox',
  add column if not exists theme             jsonb,
  add column if not exists logo_url          text,
  add column if not exists site_name         text,
  add column if not exists social_links      jsonb,
  add column if not exists demo_mode         boolean not null default true,
  add column if not exists editorial_eyebrow text,
  add column if not exists editorial_title   text;

-- Copy existing settings from the single platform_settings row into tenant 1.
update public.tenants t set
  paypal_client_id  = ps.paypal_client_id,
  paypal_secret     = ps.paypal_secret,
  paypal_mode       = coalesce(ps.paypal_mode, 'sandbox'),
  theme             = ps.theme,
  logo_url          = ps.logo_url,
  site_name         = ps.site_name,
  social_links      = ps.social_links,
  demo_mode         = coalesce(ps.demo_mode, true),
  editorial_eyebrow = ps.editorial_eyebrow,
  editorial_title   = ps.editorial_title
from public.platform_settings ps
where t.id = 1 and ps.id = 1;
