import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  email: z.string().email(),
  fp: z.string().min(8).max(128),
  company: z.string().optional(), // honeypot
});

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PRO30-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  // Fingerprint obligatorio: sin fp no hay código (anti-abuso básico).
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  // Honeypot relleno => bot. Respondemos ok falso sin insertar.
  if (parsed.data.company) {
    return NextResponse.json({ code: generateCode() });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const fp = parsed.data.fp;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  const supabase = createServiceClient();

  // Mismo dispositivo (fingerprint) ya reclamó — aunque use otro email.
  const { data: byFp } = await supabase
    .from("pro_discount_claims")
    .select("id")
    .eq("fingerprint", fp)
    .maybeSingle();
  if (byFp) {
    return NextResponse.json({ error: "already_claimed_device" }, { status: 409 });
  }

  const { data: byEmail } = await supabase
    .from("pro_discount_claims")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (byEmail) {
    return NextResponse.json({ error: "already_claimed_email" }, { status: 409 });
  }

  const code = generateCode();
  const { error } = await supabase
    .from("pro_discount_claims")
    .insert({ email, fingerprint: fp, ip, code });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "already_claimed_email" }, { status: 409 });
    }
    console.error("[pro-discount]", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ code });
}
