import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <AdminSidebar role={session.role} email={session.email} />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-text-secondary)]">
              Signed in as
            </span>
            <span className="text-xs font-medium bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)] px-3 py-1 rounded-[var(--radius-full)]">
              {session.role}
            </span>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
