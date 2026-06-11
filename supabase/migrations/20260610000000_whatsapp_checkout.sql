-- WhatsApp checkout: tenant phone number + order source tracking

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS whatsapp_checkout TEXT DEFAULT '';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'paypal';

-- Backfill existing orders as paypal
UPDATE orders SET source = 'paypal' WHERE source IS NULL;
