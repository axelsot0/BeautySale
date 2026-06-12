import "server-only";
import type { Metadata } from "next";
import { getActiveTheme } from "@/lib/data/theme-query";
import { getStorefrontTenantId } from "@/lib/tenant-context";

// generateMetadata compartido para las rutas de tienda: título del tenant.
export async function storeMetadata(): Promise<Metadata> {
  const { siteName } = await getActiveTheme(await getStorefrontTenantId());
  return {
    title: `${siteName} — Belleza, cuidado personal y accesorios`,
    description: "Productos de belleza, cuidado personal y accesorios.",
  };
}
