"use client";

import { useState, useTransition } from "react";
import { adminLogin } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!formData.get("turnstileToken")) {
      formData.set("turnstileToken", "dev-bypass");
    }

    setError(null);
    startTransition(async () => {
      const result = await adminLogin(formData);
      if (result && !result.success) {
        setError(result.error);
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

      <input type="hidden" name="turnstileToken" value="dev-bypass" />

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
