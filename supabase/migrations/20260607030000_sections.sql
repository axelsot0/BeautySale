-- Page-builder: ordered stack of storefront sections per tenant.
-- Hero (banners slot=hero) stays fixed on top, footer fixed at the bottom;
-- these rows are the customizable middle stack.
create table if not exists public.sections (
  id         uuid primary key default uuid_generate_v4(),
  tenant_id  bigint not null references public.tenants(id) on delete cascade,
  type       text not null,           -- banner | product_carousel | mosaic | flash_sale | brand_strip | newsletter
  position   int not null default 0,
  config     jsonb not null default '{}'::jsonb,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sections_tenant_idx on public.sections(tenant_id, position);

alter table public.sections enable row level security;
create policy "sections_read" on public.sections for select using (true);

grant all on public.sections to service_role;
grant select on public.sections to anon, authenticated;

create trigger sections_updated_at before update on public.sections
  for each row execute function public.set_updated_at();
