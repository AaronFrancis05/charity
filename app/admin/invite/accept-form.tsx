"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    fd.set("token", token);

    const password = fd.get("password") as string;
    const confirm = fd.get("confirmPassword") as string;

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await acceptInvite(fd);
      if (result.success) {
        router.push("/admin/dashboard");
      } else {
        setError(result.error ?? "Failed to set password");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] px-4 py-3">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium text-[var(--color-foreground)] block mb-1.5">
          New password
        </span>
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-foreground)]"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[var(--color-foreground)] block mb-1.5">
          Confirm password
        </span>
        <div className="relative">
          <Input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            minLength={8}
            placeholder="Repeat your password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-foreground)]"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </label>

      <Button type="submit" variant="default" loading={isPending} className="w-full">
        <Lock className="w-4 h-4" />
        Set password &amp; sign in
      </Button>
    </form>
  );
}
