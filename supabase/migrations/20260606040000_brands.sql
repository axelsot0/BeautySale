-- Brands shown in the storefront marquee (BrandStrip). Admin-managed.
-- While the table is empty, demo mode shows the built-in sample brands.
create table if not exists public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  font_style text not null default 'display-semibold',
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists brands_active_idx on public.brands(active, position);

alter table public.brands enable row level security;
create policy "brands_read_active" on public.brands for select using (active = true);
