"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Script from "next/script";

export interface TurnstileInstance {
  reset: () => void;
}

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
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export const TurnstileWidget = forwardRef<TurnstileInstance, TurnstileWidgetProps>(
  ({ onVerify, onExpire, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | undefined>(undefined);
    const loadedRef = useRef(false);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;

    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    function renderWidget() {
      if (!containerRef.current || !window.turnstile || loadedRef.current) return;
      loadedRef.current = true;
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerifyRef.current(token),
          "expired-callback": () => {
            if (widgetIdRef.current && window.turnstile) {
              window.turnstile.reset(widgetIdRef.current);
            }
            onExpireRef.current?.();
          },
          "error-callback": () => {
            onErrorRef.current?.("Security check failed. Please refresh the page.");
          },
          theme: "light",
        });
      } catch (err) {
        console.error("Turnstile render error:", err);
        onErrorRef.current?.("Failed to initialise security check.");
      }
    }

    useEffect(() => {
      if (!siteKey) {
        onErrorRef.current?.("Turnstile site key is not configured");
        return;
      }

      if (window.turnstile) {
        renderWidget();
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          loadedRef.current = false;
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
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={renderWidget}
          onError={() => onErrorRef.current?.("Failed to load security check. Please refresh.")}
        />
        <div ref={containerRef} className="min-h-[65px] flex justify-center" />
      </>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";
