-- Explicit grants because "auto-expose new tables" is disabled in API settings.
-- RLS still controls row-level access; grants only allow the role to "touch" the table at all.

-- service_role: full admin access (RLS bypass is automatic for this role)
grant all on public.categories       to service_role;
grant all on public.products         to service_role;
grant all on public.banners          to service_role;
grant all on public.news             to service_role;
grant all on public.orders           to service_role;
grant all on public.platform_settings to service_role;

-- anon: read catalog + insert orders (RLS narrows what they actually see/do)
grant select on public.categories       to anon;
grant select on public.products         to anon;
grant select on public.banners          to anon;
grant select on public.news             to anon;
grant select on public.platform_settings to anon;
grant insert on public.orders           to anon;

-- authenticated: same surface as anon for now (admin uses service_role server-side)
grant select on public.categories       to authenticated;
grant select on public.products         to authenticated;
grant select on public.banners          to authenticated;
grant select on public.news             to authenticated;
grant select on public.platform_settings to authenticated;
grant insert on public.orders           to authenticated;
