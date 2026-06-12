export type PayPalCaptureLike = {
  id?: string;
  amount?: {
    value?: string;
    currency_code?: string;
  };
};

export type CaptureValidation =
  | {
      ok: true;
      captureId: string;
      amount: number;
      currency: string;
    }
  | {
      ok: false;
      error: "missing_capture" | "missing_capture_id" | "missing_amount" | "currency_mismatch" | "amount_mismatch";
      expected?: string;
      actual?: string;
    };

function toCents(value: number | string): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

export function validatePayPalCapture(
  capture: PayPalCaptureLike | null | undefined,
  expectedAmount: number,
  expectedCurrency = "USD",
): CaptureValidation {
  if (!capture) return { ok: false, error: "missing_capture" };
  if (!capture.id) return { ok: false, error: "missing_capture_id" };

  const actualCurrency = capture.amount?.currency_code;
  const actualValue = capture.amount?.value;
  if (!actualCurrency || actualValue == null) return { ok: false, error: "missing_amount" };

  const normalizedExpectedCurrency = expectedCurrency.toUpperCase();
  const normalizedActualCurrency = actualCurrency.toUpperCase();
  if (normalizedActualCurrency !== normalizedExpectedCurrency) {
    return {
      ok: false,
      error: "currency_mismatch",
      expected: normalizedExpectedCurrency,
      actual: normalizedActualCurrency,
    };
  }

  const expectedCents = toCents(expectedAmount);
  const actualCents = toCents(actualValue);
  if (expectedCents == null || actualCents == null || expectedCents !== actualCents) {
    return {
      ok: false,
      error: "amount_mismatch",
      expected: expectedAmount.toFixed(2),
      actual: actualValue,
    };
  }

  return {
    ok: true,
    captureId: capture.id,
    amount: actualCents / 100,
    currency: normalizedActualCurrency,
  };
}
