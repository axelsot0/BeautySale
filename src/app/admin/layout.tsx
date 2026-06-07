import { getAdminUser } from "@/lib/auth";
import { getAdminMembership, getAdminTenantId, listTenants } from "@/lib/tenant-context";
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
  const currentTenantId = isDeveloper ? await getAdminTenantId() : 0;

  return (
    <AdminShell
      userEmail={user.email ?? ""}
      isDeveloper={isDeveloper}
      tenants={tenants}
      currentTenantId={currentTenantId}
    >
      {children}
    </AdminShell>
  );
}
