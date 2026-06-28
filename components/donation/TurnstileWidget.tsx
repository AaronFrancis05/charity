"use client";

import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const turnstile = (window as any).turnstile;
    if (!turnstile) return;
    const widgetId = turnstile.render(ref.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
      callback: onVerify,
      "expired-callback": onExpire,
    });
    return () => turnstile.remove(widgetId);
  }, [onVerify, onExpire]);

  return <div ref={ref} />;
}
