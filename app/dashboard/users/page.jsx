import { Check, Minus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import PageHeader from "@/components/dashboard/page-header";
import UsersManager from "@/components/dashboard/users-manager";
import { formatDay } from "@/lib/dashboard-constants";

export const metadata = { title: "Users" };

const PERMISSIONS = [
  ["View overview & applications", true, true],
  ["Create, edit, publish & close jobs", true, true],
  ["Change application status, add notes, download CVs, export CSV", true, true],
  ["Delete jobs", true, false],
  ["Delete applications", true, false],
  ["Manage users & roles", true, false],
];

export default async function UsersPage() {
  const me = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { jobs: true } },
    },
  });

  const items = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    jobsCount: u._count.jobs,
    createdLabel: formatDay(u.createdAt),
  }));

  const admins = users.filter((u) => u.role === "ADMIN").length;
  const hr = users.filter((u) => u.role === "HR").length;

  return (
    <>
      <PageHeader title="Users" description={`${admins} admin${admins === 1 ? "" : "s"} · ${hr} HR · There is no public sign-up. Accounts are created here.`} />

      <UsersManager users={items} currentUserId={me.id} />

      <section className="surface-card mt-8 overflow-x-auto" aria-labelledby="perm-title">
        <h2 id="perm-title" className="text-headline-sm p-6 pb-2">
          What each role can do
        </h2>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Permission</th>
              <th scope="col">Admin</th>
              <th scope="col">HR</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map(([label, admin, hrAllowed]) => (
              <tr key={label}>
                <td>{label}</td>
                {[admin, hrAllowed].map((allowed, i) => (
                  <td key={i}>
                    {allowed ? (
                      <Check className="size-5 text-emerald-600" aria-label="Allowed" />
                    ) : (
                      <Minus className="size-5 text-on-surface-variant" aria-label="Not allowed" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}