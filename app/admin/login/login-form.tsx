"use client";

import { useState, useTransition, useRef } from "react";
import { adminLogin } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TurnstileWidget, TurnstileInstance } from "@/components/donation/TurnstileWidget";
import Link from "next/link";

interface AdminLoginFormProps {
  alreadyAuthenticated?: boolean;
}

export function AdminLoginForm({ alreadyAuthenticated }: AdminLoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(null);
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
        // CRITICAL: reset Turnstile so a fresh token is generated for next attempt
        setTurnstileToken("");
        turnstileRef.current?.reset();
      }
    });
  }

  return (
    <div className="space-y-6">
      {alreadyAuthenticated && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <p className="flex items-center gap-2">
            <span>⚠️</span>
            <span>
              You are currently signed in on another session. Signing in here will create a new one.{" "}
              <Link href="/admin/dashboard" className="underline font-semibold">
                Go to dashboard instead →
              </Link>
            </span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] px-3 py-2.5">
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          </div>
        )}

        <div className="space-y-4">
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
              className="text-base min-h-[44px]"
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
              className="text-base min-h-[44px]"
            />
          </label>
        </div>

        <div className="flex justify-center overflow-hidden my-2">
          <div className="w-full max-w-[300px]">
            <TurnstileWidget
              ref={turnstileRef}
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => {
                setTurnstileToken("");
                turnstileRef.current?.reset();
              }}
              onError={(err) => {
                setError(err);
                setTurnstileToken("");
              }}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          loading={isPending}
          className="w-full min-h-[48px] text-base"
          disabled={!turnstileToken || isPending}
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}
