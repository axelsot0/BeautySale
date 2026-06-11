// Pure, client-safe demo-mode helpers. No DB, no server-only imports.

// Admin sections locked while a store is in demo mode (premium-only).
// A demo store keeps a demonstrable core: dashboard, orders, products,
// categories, hero banner, store name. Everything below is gated.
export const DEMO_LOCKED_PATHS = [
  "/admin/theme",
  "/admin/flash-sale",
  "/admin/sections",
  "/admin/brands",
  "/admin/news",
  "/admin/admins",
];

export function isPathLockedInDemo(pathname: string): boolean {
  return DEMO_LOCKED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export type TenantStatus = {
  isDemo: boolean;
  demoExpiresAt: string | null;
  daysLeft: number | null;
  expired: boolean;
};

export const NON_DEMO_STATUS: TenantStatus = {
  isDemo: false,
  demoExpiresAt: null,
  daysLeft: null,
  expired: false,
};
