import { adminLogin } from "@/actions/auth";
import { AdminLoginForm } from "./login-form";

export const metadata = { title: "Admin Login — Open Hearts Foundation" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Open Hearts Foundation</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Admin panel</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6">
          <h2 className="text-base font-semibold text-[var(--color-foreground)] mb-5">
            Sign in to continue
          </h2>
          <AdminLoginForm />
        </div>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          Protected system. No public registration.
        </p>
      </div>
    </div>
  );
}
