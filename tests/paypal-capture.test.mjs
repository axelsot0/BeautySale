import test from "node:test";
import assert from "node:assert/strict";
import { validatePayPalCapture } from "../src/lib/paypal-capture.ts";

test("accepts a completed capture with the expected amount and currency", () => {
  const result = validatePayPalCapture(
    { id: "CAPTURE-1", amount: { value: "49.99", currency_code: "usd" } },
    49.99,
  );

  assert.deepEqual(result, {
    ok: true,
    captureId: "CAPTURE-1",
    amount: 49.99,
    currency: "USD",
  });
});

test("rejects a capture with a mismatched amount", () => {
  const result = validatePayPalCapture(
    { id: "CAPTURE-1", amount: { value: "48.99", currency_code: "USD" } },
    49.99,
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "amount_mismatch");
});

test("rejects a capture with a mismatched currency", () => {
  const result = validatePayPalCapture(
    { id: "CAPTURE-1", amount: { value: "49.99", currency_code: "EUR" } },
    49.99,
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "currency_mismatch");
});

test("rejects a capture without an id", () => {
  const result = validatePayPalCapture(
    { amount: { value: "49.99", currency_code: "USD" } },
    49.99,
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "missing_capture_id");
});
