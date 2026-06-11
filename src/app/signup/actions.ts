"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { provisionStore } from "@/lib/provision";
import { syncAdminClaims } from "@/lib/auth";

const schema = z.object({
  store_name: z.string().min(1).max(60),
  full_name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export type SignupState = { error?: string };

// Public self-service: creates a 15-day demo store and auto-logs the owner in.
export async function signupStore(_prev: SignupState, formData: FormData): Promise<SignupState> {
  // Honeypot — bots fill hidden fields.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { error: "Error de validación" };
  }

  const parsed = schema.safeParse({
    store_name: formData.get("store_name"),
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Revisá los campos: email válido, contraseña de 6+ caracteres y nombre de tienda." };
  }

  const { store_name, full_name, email, password } = parsed.data;

  const result = await provisionStore({
    email,
    full_name,
    password,
    store_name,
    isDemo: true,
    createdBy: null,
  });
  if (!result.ok) return { error: result.error };

  // Auto sign-in so the owner lands straight in their admin panel.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login"); // created OK, just couldn't auto-login

  await syncAdminClaims(result.userId, email);
  await supabase.auth.updateUser({ data: { is_admin: true } });
  await supabase.auth.refreshSession();

  redirect("/admin");
}
