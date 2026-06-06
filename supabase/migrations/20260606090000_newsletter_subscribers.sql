create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  code        text not null,
  used        boolean default false,
  fingerprint text,
  ip          text,
  created_at  timestamptz default now()
);

create index if not exists idx_newsletter_fp
  on newsletter_subscribers (fingerprint)
  where fingerprint is not null;

-- RLS: only service role can read/write
alter table newsletter_subscribers enable row level security;
