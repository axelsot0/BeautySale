import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { deleteTenantCascade } from "@/lib/provision";

export const dynamic = "force-dynamic";

// Deletes demo stores whose 15-day window has elapsed and were never promoted.
// Triggered by Vercel Cron (Authorization: Bearer <CRON_SECRET>). Also callable
// manually by the developer with the same secret.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: expired, error } = await supabase
    .from("tenants")
    .select("id, slug")
    .eq("is_demo", true)
    .lt("demo_expires_at", nowIso);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const deleted: string[] = [];
  for (const t of expired ?? []) {
    await deleteTenantCascade(t.id);
    deleted.push(t.slug);
  }

  return NextResponse.json({ ok: true, deleted, count: deleted.length });
}
