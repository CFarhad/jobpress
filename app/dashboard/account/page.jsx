import { requireUser } from "@/lib/session";
import PageHeader from "@/components/dashboard/page-header";
import { RoleBadge } from "@/components/dashboard/badges";
import ChangePasswordForm from "@/components/dashboard/change-password-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Account" description="Your profile and security settings." />

      <section className="surface-card mb-6 p-6" aria-labelledby="profile-title">
        <h2 id="profile-title" className="text-headline-sm mb-4">
          Profile
        </h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-on-surface-variant">Name</dt>
            <dd className="font-semibold">{user.name}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Email</dt>
            <dd className="font-semibold">{user.email}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Role</dt>
            <dd className="mt-0.5">
              <RoleBadge role={user.role} />
            </dd>
          </div>
        </dl>
      </section>

      <section className="surface-card p-6" aria-labelledby="pw-title">
        <h2 id="pw-title" className="text-headline-sm mb-4">
          Change password
        </h2>
        <ChangePasswordForm />
      </section>
    </>
  );
}