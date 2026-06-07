-- Extend admins into tenant memberships with roles.
-- role: developer (platform owner) | superadmin (store owner) | admin (staff)

alter table public.admins
  add column if not exists tenant_id bigint references public.tenants(id) on delete cascade,
  add column if not exists role text not null default 'admin',
  add column if not exists active boolean not null default true;

-- Constrain role values.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admins_role_check'
  ) then
    alter table public.admins
      add constraint admins_role_check
      check (role in ('developer', 'superadmin', 'admin'));
  end if;
end $$;

-- Backfill: existing admins belong to the seeded tenant.
update public.admins set tenant_id = 1 where tenant_id is null;

-- Promote the platform owner to developer.
update public.admins set role = 'developer' where lower(email) = 'axelmlsoto@gmail.com';

create index if not exists admins_tenant_idx on public.admins (tenant_id);
