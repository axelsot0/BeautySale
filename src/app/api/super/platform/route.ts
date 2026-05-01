import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  active: z.boolean().optional(),
  message_when_off: z.string().min(1).max(500).optional(),
});

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function checkSuperToken(request: NextRequest) {
  const expected = process.env.SUPER_ADMIN_TOKEN;
  if (!expected) return false;
  const provided = request.headers.get("x-super-token");
  return provided === expected;
}

export async function GET(request: NextRequest) {
  if (!checkSuperToken(request)) return unauthorized();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("active, message_when_off, updated_at")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!checkSuperToken(request)) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const update = parsed.data;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "empty payload" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .update(update)
    .eq("id", 1)
    .select("active, message_when_off, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
