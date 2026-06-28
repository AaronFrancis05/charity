import "server-only";
import { PostHog } from "posthog-node";

function getServerClient(): PostHog {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1,
    flushInterval: 0,
  });
}

export function captureServerEvent(
  event: string,
  distinctId: string,
  properties?: Record<string, unknown>
) {
  try {
    const client = getServerClient();
    client.capture({ event, distinctId, properties });
    client.shutdown().catch(() => {});
  } catch {
    // Silently fail — never break the app for analytics
  }
}

export function captureServerException(
  error: Error,
  distinctId: string,
  context?: Record<string, unknown>
) {
  try {
    const client = getServerClient();
    client.captureException(error, distinctId, context);
    client.shutdown().catch(() => {});
  } catch {
    // Silently fail
  }
}
