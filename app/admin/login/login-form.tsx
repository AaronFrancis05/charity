"use client";

import { useState, useTransition } from "react";
import { adminLogin } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/donation/TurnstileWidget";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!turnstileToken) {
      setError("Please complete the security check");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("turnstileToken", turnstileToken);

    setError(null);
    startTransition(async () => {
      const result = await adminLogin(formData);
      if (result && !result.success) {
        setError(result.error);
        setTurnstileToken("");
        setTurnstileKey((k) => k + 1);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] px-3 py-2.5">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      <label className="block">
        <span className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
          Email address
        </span>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@openheartsfoundation.org"
          required
        />
      </label>

      <label className="block">
        <span className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
          Password
        </span>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          minLength={8}
        />
      </label>

      <div>
        <TurnstileWidget
          key={turnstileKey}
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken("")}
        />
      </div>

      <Button
        type="submit"
        variant="default"
        loading={isPending}
        className="w-full"
      >
        Sign in
      </Button>
    </form>
  );
}
