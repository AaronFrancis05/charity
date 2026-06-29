import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

function AvatarFallback({ name, email }: { name: string; email: string }) {
  const letter = (name || email).charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)] flex items-center justify-center text-sm font-bold shrink-0">
      {letter}
    </div>
  );
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const displayName = session.name || session.email.split("@")[0];

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <AdminSidebar role={session.role} email={session.email} name={session.name} />

      <main className="lg:ml-72 flex-1 pt-14 lg:pt-0">
        {/* Top bar (Desktop) */}
        <header className="hidden lg:flex bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-3 items-center justify-between sticky top-0 z-20">
          <Link
            href="/admin/dashboard/profile"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <AvatarFallback name={session.name} email={session.email} />
            <div className="text-left">
              <p className="text-sm font-medium text-[var(--color-foreground)] leading-tight">
                {displayName}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-tight">
                {session.role.replace("_", " ")}
              </p>
            </div>
          </Link>
          <span className="text-xs font-medium bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)] px-3 py-1 rounded-[var(--radius-full)]">
            {session.role}
          </span>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 min-h-screen">{children}</div>
      </main>
    </div>
  );
}

