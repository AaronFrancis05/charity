import { validateInviteToken, acceptInvite } from "@/actions/auth";
import { AcceptInviteForm } from "./accept-form";

export const metadata = { title: "Accept Invitation — Open Hearts Foundation" };

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Invalid link</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            This invitation link is missing a token. Ask your admin to send a new invitation.
          </p>
        </div>
      </div>
    );
  }

  const result = await validateInviteToken(token);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Invitation issue</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-1">
            Set your password
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {result.data?.email} &middot;{" "}
            {result.data?.role === "super_admin" ? "Super Admin" : "Content Admin"}
          </p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6">
          <AcceptInviteForm token={token} />
        </div>
      </div>
    </div>
  );
}
