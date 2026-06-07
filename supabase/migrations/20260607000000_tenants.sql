-- Multi-tenant foundations (path-based routing).
-- Each store = one tenant, owned by a superadmin. Developer controls tenants.

create table if not exists public.tenants (
  id         bigserial primary key,
  slug       text not null unique,
  name       text not null,
  owner_id   uuid,                              -- auth user of the superadmin
  active     boolean not null default true,
  created_by uuid,                              -- developer who provisioned it
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed the current single store as tenant 1.
insert into public.tenants (id, slug, name, active)
values (1, 'beautysale', 'BeautySale', true)
on conflict (id) do nothing;

-- Keep the sequence ahead of the seeded id.
select setval(
  pg_get_serial_sequence('public.tenants', 'id'),
  greatest((select max(id) from public.tenants), 1)
);

create trigger tenants_updated_at before update on public.tenants
  for each row execute function public.set_updated_at();

-- RLS: read open (storefront resolves active tenants); writes via service_role only.
alter table public.tenants enable row level security;
create policy "tenants_read" on public.tenants for select using (true);
grant select on public.tenants to anon, authenticated;
