import "server-only";
import { headers } from "next/headers";

/**
 * Extracts the client's IP address from the incoming request headers.
 * Server-only — uses next/headers.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();

  const xForwardedFor = headerList.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIp = headerList.get("x-real-ip");
  if (xRealIp) return xRealIp;

  return "127.0.0.1";
}
