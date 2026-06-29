"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteAdmin } from "@/actions/auth";
import { Card } from "@/components/cards/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Shield } from "lucide-react";

interface AdminRecord {
  id: string;
  email: string;
  role: string;
  name: string;
  is_active: boolean;
  last_login_at: string | null;
  password_set: boolean;
  created_at: string;
}

export function AdminsList({
  admins,
  error,
  currentAdminId,
}: {
  admins: AdminRecord[];
  error?: string;
  currentAdminId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("content_admin");

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await inviteAdmin(fd);
      if (result.success) {
        setFormSuccess(true);
        setEmail("");
        setRole("content_admin");
        setShowForm(false);
        router.refresh();
      } else {
        setFormError(result.error ?? "Failed to invite");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* API error */}
      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] px-4 py-3">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      {/* Invite form */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">
            Invite new admin
          </h2>
          <Button
            type="button"
            variant="default"
            onClick={() => setShowForm(!showForm)}
          >
            <UserPlus className="w-4 h-4" />
            {showForm ? "Cancel" : "Invite admin"}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleInvite} className="space-y-4 border-t border-[var(--color-border)] pt-4">
            {formError && (
              <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] px-4 py-3">
                <p className="text-sm text-[var(--color-error)]">{formError}</p>
              </div>
            )}

            {formSuccess && (
              <div className="bg-[var(--color-success-bg)] border border-[var(--color-success)] rounded-[var(--radius-md)] px-4 py-3">
                <p className="text-sm text-[var(--color-success)]">
                  Invitation sent! The new admin will receive an email with a link to set their password.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="text-sm font-medium text-[var(--color-foreground)] block mb-1.5">
                  Email address
                </label>
                <Input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.org"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-foreground)] block mb-1.5">
                  Role
                </label>
                <Select name="role" value={role} onValueChange={(v) => setRole(v ?? "content_admin")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content_admin">Content Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="default" loading={isPending} className="w-full">
                  <Mail className="w-4 h-4" />
                  Send invite
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>

      {/* Admins table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Name</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Role</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Last login</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                    No admins found
                  </td>
                </tr>
              )}
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-muted)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)] flex items-center justify-center text-xs font-bold shrink-0">
                        {(admin.name || admin.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[var(--color-foreground)] font-medium">
                        {admin.name || "—"}
                      </span>
                      {admin.id === currentAdminId && (
                        <span className="text-[10px] text-[var(--color-text-muted)]">(you)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{admin.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)] px-2.5 py-1 rounded-[var(--radius-full)]">
                      <Shield className="w-3 h-3" />
                      {admin.role === "super_admin" ? "Super Admin" : "Content Admin"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!admin.password_set ? (
                      <span className="text-xs text-[var(--color-brand-gold)] font-medium">Invited</span>
                    ) : admin.is_active ? (
                      <span className="text-xs text-[var(--color-success)] font-medium">Active</span>
                    ) : (
                      <span className="text-xs text-[var(--color-error)] font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                    {admin.last_login_at
                      ? new Date(admin.last_login_at).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
