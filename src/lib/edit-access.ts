import "server-only";
import { cache } from "react";
import { getAdminMembership } from "@/lib/tenant-context";

// True si el usuario logueado puede editar ESTA tienda inline:
// developer (plataforma) o admin/superadmin cuyo tenant coincide.
export const canEditStorefront = cache(async (tenantId: number): Promise<boolean> => {
  const m = await getAdminMembership();
  if (!m) return false;
  return m.role === "developer" || m.tenantId === tenantId;
});
