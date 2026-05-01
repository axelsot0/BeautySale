-- BeautySale initial schema
-- Bold & Colorful e-commerce: products, categories, banners, news, orders, platform settings

create extension if not exists "uuid-ossp";

-- Categories
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  color text not null default '#FF4D8B',
  icon text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Products
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  discount_percent int not null default 0 check (discount_percent between 0 and 100),
  stock int not null default 0 check (stock >= 0),
  category_id uuid references public.categories(id) on delete set null,
  featured boolean not null default false,
  on_sale boolean not null default false,
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_featured_idx on public.products(featured) where featured = true;
create index products_on_sale_idx on public.products(on_sale) where on_sale = true;

-- Banners (hero, mosaico, etc.)
create table public.banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  image_url text not null,
  link text,
  position int not null default 0,
  active boolean not null default true,
  slot text not null default 'hero', -- hero | mosaic | sale
  created_at timestamptz not null default now()
);

create index banners_active_idx on public.banners(active, slot, position);

-- News bar messages (marquee)
create table public.news (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  active boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index news_active_idx on public.news(active, position);

-- Orders (PayPal)
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  paypal_order_id text unique,
  status text not null default 'pending' check (status in ('pending','paid','cancelled','refunded','shipped','delivered')),
  items jsonb not null,
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  customer_email text not null,
  customer_name text not null,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_idx on public.orders(status, created_at desc);
create index orders_email_idx on public.orders(customer_email);

-- Platform settings (single row, super-admin controlled)
create table public.platform_settings (
  id int primary key default 1,
  active boolean not null default true,
  message_when_off text not null default 'Estamos haciéndonos lindas. Volvemos pronto.',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.platform_settings (id, active) values (1, true);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create trigger platform_settings_updated_at before update on public.platform_settings
  for each row execute function public.set_updated_at();

-- ===== RLS =====
-- Public read for catalog. All writes go through server-side code with service_role key.

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.news enable row level security;
alter table public.orders enable row level security;
alter table public.platform_settings enable row level security;

-- Read policies (anon + authenticated)
create policy "categories_read_all" on public.categories for select using (true);
create policy "products_read_all" on public.products for select using (true);
create policy "banners_read_active" on public.banners for select using (active = true);
create policy "news_read_active" on public.news for select using (active = true);
create policy "platform_settings_read" on public.platform_settings for select using (true);

-- Orders: anon can insert (guest checkout), no read except via server
create policy "orders_insert_anon" on public.orders for insert with check (true);

-- All other writes = service_role only (bypasses RLS by default).
-- No policies = no anon/authenticated writes.
