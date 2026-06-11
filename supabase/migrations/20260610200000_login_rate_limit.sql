-- Login rate-limiting table.
-- Stores every login attempt (success or failure) keyed by IP.
-- The app queries this before attempting Supabase Auth to block brute-force.
-- Rows older than 1 hour are purged on each check to keep the table small.

CREATE TABLE IF NOT EXISTS public.login_attempts (
  id           BIGSERIAL PRIMARY KEY,
  ip           TEXT        NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_attempted_at
  ON public.login_attempts (ip, attempted_at);

-- No RLS needed — accessed only via service_role from server actions.
