"use client";

import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: string;
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({ onVerify, onExpire, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;

  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!containerRef.current) return;
    if (!siteKey) {
      onErrorRef.current?.("Turnstile site key is not configured");
      return;
    }

    const timeout = setTimeout(() => {
      clearInterval(interval);
      onErrorRef.current?.("Security check failed to load. Please refresh the page.");
    }, 10000);

    const interval = setInterval(() => {
      if (window.turnstile && containerRef.current) {
        clearInterval(interval);
        clearTimeout(timeout);
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => onVerifyRef.current(token),
            "expired-callback": () => onExpireRef.current?.(),
          });
        } catch {
          onErrorRef.current?.("Failed to initialise security check.");
        }
      }
    }, 200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey]);

  if (!siteKey) {
    return (
      <p className="text-xs text-[var(--color-error)]">
        Security check unavailable.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-[65px]"
    />
  );
}
