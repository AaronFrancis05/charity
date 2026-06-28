import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false,
      session_recording: {
        maskAllInputs: true,
      },
      autocapture: true,
      rageclick: true,
    });
  }
}

export function captureClientError(
  error: Error,
  context?: Record<string, unknown>
) {
  try {
    posthog.captureException(error, context);
  } catch {
    // Silently fail — never break the app for analytics
  }
}

function installConsoleErrorInterceptor() {
  if (typeof window === "undefined") return;

  const original = console.error;
  console.error = (...args: unknown[]) => {
    const error = args.find((a) => a instanceof Error) as Error | undefined;
    if (error) {
      captureClientError(error, { source: "console.error", args: args.map(String) });
    } else {
      captureClientError(new Error(args.map(String).join(" ")), {
        source: "console.error",
      });
    }
    original.apply(console, args);
  };
}

function installGlobalErrorListeners() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    captureClientError(event.error ?? new Error(event.message), {
      source: "window.onerror",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
    captureClientError(error, { source: "unhandledrejection" });
  });
}

export function installClientErrorTracking() {
  installConsoleErrorInterceptor();
  installGlobalErrorListeners();
}

export { posthog };
