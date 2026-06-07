// Cookie name shared by the proxy (edge) and server helpers. Keep this module
// free of server-only / next/headers imports so the edge runtime can use it.
export const TENANT_COOKIE = "bs_tenant";
