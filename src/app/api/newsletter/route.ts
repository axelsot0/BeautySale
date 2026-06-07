import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { sendNewsletterWelcome } from "@/lib/email";
import { getStorefrontTenantId } from "@/lib/tenant-context";

const schema = z.object({
  email: z.string().email(),
  fp: z.string().max(128).optional(),
});

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GLOW-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const { email, fp } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  const ip = getClientIp(req);
  const tenantId = await getStorefrontTenantId();
  const supabase = createServiceClient();

  // 1. Email already subscribed (to this store)?
  const { data: byEmail } = await supabase
    .from("newsletter_subscribers")
    .select("id, code")
    .eq("tenant_id", tenantId)
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (byEmail) {
    return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
  }

  // 2. Fingerprint already used with a different email (in this store)?
  if (fp) {
    const { data: byFp } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("fingerprint", fp)
      .maybeSingle();

    if (byFp) {
      return NextResponse.json({ error: "already_claimed" }, { status: 409 });
    }
  }

  // 3. Insert
  const code = generateCode();
  const { error: insertError } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: normalizedEmail, code, fingerprint: fp ?? null, ip, tenant_id: tenantId });

  if (insertError) {
    // Race condition: duplicate email inserted concurrently
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
    }
    console.error("[newsletter]", insertError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // 4. Send email (non-blocking — don't fail the request if email fails)
  sendNewsletterWelcome(normalizedEmail, code).catch((err) =>
    console.error("[newsletter] email send failed:", err),
  );

  return NextResponse.json({ code });
}
