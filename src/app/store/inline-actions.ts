"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { canEditStorefront } from "@/lib/edit-access";

export type InlineState = { ok?: boolean; error?: string };

// El tenant sale de la cookie de storefront (misma tienda que se está viendo);
// el permiso se valida contra la membresía del admin logueado.
async function requireEditTenant(): Promise<number> {
  const tenantId = await getStorefrontTenantId();
  if (!(await canEditStorefront(tenantId))) throw new Error("unauthorized");
  return tenantId;
}

function text(fd: FormData, name: string, max: number): string {
  return String(fd.get(name) ?? "").trim().slice(0, max);
}

// Dispatcher único del modo edición inline. `kind` decide qué se guarda.
export async function inlineSave(formData: FormData): Promise<InlineState> {
  let tenantId: number;
  try {
    tenantId = await requireEditTenant();
  } catch {
    return { error: "No autorizado" };
  }

  const kind = String(formData.get("kind") ?? "");
  const supabase = createServiceClient();

  if (kind === "hero") {
    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "Hero no encontrado" };
    const title = text(formData, "title", 120);
    if (!title) return { error: "El título es obligatorio" };
    const { error } = await supabase
      .from("banners")
      .update({
        title,
        subtitle: text(formData, "subtitle", 200) || null,
        eyebrow_text: text(formData, "eyebrow_text", 40) || null,
        cta_label: text(formData, "cta_label", 40) || null,
        link: text(formData, "link", 500) || null,
        cta2_label: text(formData, "cta2_label", 40) || null,
        cta2_link: text(formData, "cta2_link", 200) || null,
        marquee_text: text(formData, "marquee_text", 60) || null,
      })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .eq("slot", "hero");
    if (error) return { error: error.message };
  } else if (kind === "section") {
    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "Sección no encontrada" };
    const { data: row } = await supabase
      .from("sections")
      .select("config")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (!row) return { error: "Sección no encontrada" };
    const config = { ...(row.config as Record<string, unknown>) };
    // Solo pisa los campos presentes en el form
    for (const [name, max] of [
      ["title", 120],
      ["subtitle", 200],
      ["eyebrow", 60],
      ["cta_label", 40],
      ["cta_link", 500],
      ["bg_color", 9],
    ] as const) {
      if (formData.has(name)) config[name] = text(formData, name, max);
    }
    const { error } = await supabase
      .from("sections")
      .update({ config, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) return { error: error.message };
  } else if (kind === "editorial") {
    const { error } = await supabase
      .from("tenants")
      .update({
        editorial_eyebrow: text(formData, "eyebrow", 60) || null,
        editorial_title: text(formData, "title", 80) || null,
      })
      .eq("id", tenantId);
    if (error) return { error: error.message };
  } else if (kind === "newsletter") {
    const { error } = await supabase
      .from("tenants")
      .update({
        newsletter_title: text(formData, "title", 80) || null,
        newsletter_subtitle: text(formData, "subtitle", 200) || null,
      })
      .eq("id", tenantId);
    if (error) return { error: error.message };
  } else {
    return { error: "Tipo desconocido" };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
