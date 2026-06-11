-- Demo-mode tenants: self-service signup creates a 15-day demo store.
-- A demo store is live (active=true) but feature-gated and auto-deleted if the
-- developer does not promote it (is_demo -> false) within demo_expires_at.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMPTZ;

-- Existing stores are official, never demo.
UPDATE tenants SET is_demo = false WHERE is_demo IS NULL;
