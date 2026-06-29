
import { getAdminSession } from "@/actions/auth";
import { InviteAdminForm } from "@/app/admin/dashboard/admins/invite/invite-admin-form";
import { redirect } from "next/navigation";

export default async function InviteAdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "super_admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        Invite New Admin
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        An invitation link will be sent to the email address below. The user
        will be prompted to set their password.
      </p>
      <div className="mt-8">
        <InviteAdminForm />
      </div>
    </div>
  );
}
