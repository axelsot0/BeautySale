-- Discount code applied to an order (newsletter GLOW-XXXXXX, 10% one-time).
alter table public.orders
  add column if not exists discount_code text,
  add column if not exists discount_amount numeric(10,2) not null default 0;
