"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, installClientErrorTracking, posthog } from "@/lib/posthog-client";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      posthog.capture("$pageview", {
        path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
    installClientErrorTracking();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
