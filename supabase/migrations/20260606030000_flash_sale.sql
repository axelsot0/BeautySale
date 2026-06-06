-- Flash sale: single-row config (id=1). No seed row on purpose:
-- while no row exists, the storefront shows the demo flash sale (when demo_mode is on).
-- Once the admin saves, the row owns the behavior (active=false hides it; demo no longer applies).
create table if not exists public.flash_sale (
  id int primary key default 1,
  active boolean not null default true,
  title text not null default 'Flash sale 24hs',
  discount_label text not null default '-40% OFF',
  description text not null default 'En selección de cuidado facial y labiales. Sin código, descuento aplicado al carrito.',
  cta_link text not null default '/ofertas',
  ends_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint flash_single_row check (id = 1)
);

alter table public.flash_sale enable row level security;
create policy "flash_sale_read" on public.flash_sale for select using (true);

create trigger flash_sale_updated_at before update on public.flash_sale
  for each row execute function public.set_updated_at();
