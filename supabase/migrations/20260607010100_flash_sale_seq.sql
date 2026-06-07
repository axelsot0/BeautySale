-- flash_sale.id had a fixed default of 1 (single-row design). Now one row per tenant,
-- so give it a real sequence to avoid PK collisions on the second tenant.
create sequence if not exists flash_sale_id_seq owned by public.flash_sale.id;
select setval('flash_sale_id_seq', greatest((select max(id) from public.flash_sale), 1));
alter table public.flash_sale alter column id set default nextval('flash_sale_id_seq');
