-- Solicitudes de suscripción por transferencia (WhatsApp).
-- El admin elige plan y pide por WhatsApp; el dev las aprueba desde /dev.
-- tenant_id es NULL cuando la solicitud viene de un visitante sin cuenta.

CREATE TABLE IF NOT EXISTS public.subscription_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   INTEGER REFERENCES public.tenants(id) ON DELETE SET NULL,
  plan        TEXT    NOT NULL CHECK (plan IN ('basic', 'pro')),
  months      INTEGER NOT NULL DEFAULT 1,
  amount      NUMERIC(10,2) NOT NULL,
  currency    TEXT    NOT NULL DEFAULT 'USD',
  email       TEXT    NOT NULL,
  store_name  TEXT    NOT NULL,
  method      TEXT    NOT NULL DEFAULT 'whatsapp',
  status      TEXT    NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscription_requests_status
  ON public.subscription_requests (status, created_at DESC);

CREATE INDEX IF NOT EXISTS subscription_requests_tenant
  ON public.subscription_requests (tenant_id);

-- Auto-expose de tablas nuevas está deshabilitado: grant explícito.
grant all on public.subscription_requests to service_role;
