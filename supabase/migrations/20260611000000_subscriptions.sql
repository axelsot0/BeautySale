-- Fase A: planes y suscripciones.
-- El dev asigna plan manualmente desde /dev. Pagos online llegan en Fase C.

-- Plan actual del tenant (estado vivo, lectura rápida)
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'demo'
    CHECK (plan IN ('demo', 'basic', 'pro')),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Tiendas oficiales existentes quedan en pro (sin vencimiento por ahora)
UPDATE public.tenants SET plan = 'pro' WHERE is_demo = false;

-- Historial de pagos de suscripción (registrados por el dev por ahora)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id         BIGSERIAL PRIMARY KEY,
  tenant_id  INTEGER NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan       TEXT    NOT NULL CHECK (plan IN ('basic', 'pro')),
  months     INTEGER NOT NULL DEFAULT 1,
  amount     NUMERIC(10,2) NOT NULL,
  currency   TEXT    NOT NULL DEFAULT 'USD',
  method     TEXT    NOT NULL DEFAULT 'manual',
  note       TEXT,
  paid_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscription_payments_tenant
  ON public.subscription_payments (tenant_id, paid_at DESC);

-- Códigos de descuento 30% para plan Pro (promo de captación).
-- Un código por email Y por dispositivo (fingerprint) — anti-abuso.
CREATE TABLE IF NOT EXISTS public.pro_discount_claims (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  fingerprint TEXT NOT NULL,
  ip          TEXT NOT NULL DEFAULT 'unknown',
  code        TEXT NOT NULL UNIQUE,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pro_discount_claims_fingerprint
  ON public.pro_discount_claims (fingerprint);
