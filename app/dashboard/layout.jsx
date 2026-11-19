import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import DashboardShell from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";
export const metadata = {
  title: { default: "Dashboard", template: "%s | Dashboard" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  const newCount = await prisma.application.count({ where: { status: "NEW" } });

  return (
    <DashboardShell user={user} newCount={newCount}>
      {children}
    </DashboardShell>
  );
}