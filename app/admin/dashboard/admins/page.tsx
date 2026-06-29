import { redirect } from "next/navigation";
import { getAdminSession, getAdmins } from "@/actions/auth";
import { AdminsList } from "./admins-list";

export const metadata = { title: "Manage Admins — Open Hearts Foundation" };

export default async function ManageAdminsPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") redirect("/admin/dashboard");

  const result = await getAdmins();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[clamp(20px,2.5vw,28px)] font-bold text-[var(--color-foreground)] mb-1">
            Manage admins
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Invite and manage admin accounts
          </p>
        </div>
      </div>

      <AdminsList
        admins={result.data ?? []}
        error={result.error}
        currentAdminId={session.adminId}
      />
    </div>
  );
}
