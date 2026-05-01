import { getAdminUser } from "@/lib/auth";
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

  return <AdminShell userEmail={user.email ?? ""}>{children}</AdminShell>;
}
