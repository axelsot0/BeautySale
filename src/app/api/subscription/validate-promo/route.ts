import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({ code: z.string().min(1).max(40) });

// Valida un código promo Pro (tabla pro_discount_claims) sin consumirlo.
// Solo informa si existe y no fue usado; el consumo ocurre en el capture.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ valid: false });

  const code = parsed.data.code.trim().toUpperCase();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("pro_discount_claims")
    .select("used")
    .eq("code", code)
    .maybeSingle();

  if (!data) return NextResponse.json({ valid: false, reason: "promo_invalid" });
  if (data.used) return NextResponse.json({ valid: false, reason: "promo_used" });
  return NextResponse.json({ valid: true });
}
