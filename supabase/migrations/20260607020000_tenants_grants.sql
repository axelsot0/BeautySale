-- Auto-expose of new tables is disabled, so grant explicitly.
grant all on public.tenants to service_role;
grant usage, select on sequence public.tenants_id_seq to service_role;
grant select on public.tenants to anon, authenticated;
