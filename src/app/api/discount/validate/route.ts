import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkDiscountCode } from "@/lib/discount";
import { getStorefrontTenantId } from "@/lib/tenant-context";

const schema = z.object({ code: z.string().min(1).max(40) });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "invalid" }, { status: 400 });
  }

  // Scope to the requesting storefront's tenant — prevents cross-tenant enumeration.
  const tenantId = await getStorefrontTenantId();
  const result = await checkDiscountCode(parsed.data.code, tenantId);
  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.reason }, { status: 200 });
  }
  return NextResponse.json({ valid: true, percent: result.percent });
}
