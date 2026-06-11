import { getAdminUser } from "@/lib/auth";
import { getAdminMembership, getAdminTenantId, listTenants } from "@/lib/tenant-context";
import { getTenantStatus } from "@/lib/demo-server";
import { AdminShell } from "./_components/AdminShell";

export const metadata = { title: "Admin · BeautySale" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  // Login page renders without the shell. Proxy handles auth redirects for everything else.
  if (!user) return <>{children}</>;

  const membership = await getAdminMembership();
  const isDeveloper = membership?.role === "developer";

  const tenants = isDeveloper ? await listTenants() : [];
  const tenantId = await getAdminTenantId();
  const currentTenantId = isDeveloper ? tenantId : 0;

  // Developers are never gated; they manage every store. Demo gating applies to
  // the store owner only.
  const status = isDeveloper ? null : await getTenantStatus(tenantId);

  const DAY_MS = 24 * 60 * 60 * 1000;
  const planDaysLeft = status?.planExpiresAt
    ? Math.max(0, Math.ceil((new Date(status.planExpiresAt).getTime() - Date.now()) / DAY_MS))
    : null;

  return (
    <AdminShell
      userEmail={user.email ?? ""}
      isDeveloper={isDeveloper}
      tenants={tenants}
      currentTenantId={currentTenantId}
      isDemo={status?.isDemo ?? false}
      demoDaysLeft={status?.daysLeft ?? null}
      planDaysLeft={planDaysLeft}
    >
      {children}
    </AdminShell>
  );
}
