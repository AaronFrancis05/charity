import "server-only";
import { createClient } from "@insforge/sdk";

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const insforgeServiceKey = process.env.INSFORGE_SERVICE_KEY!;

if (!insforgeUrl || !insforgeServiceKey) {
  throw new Error("Missing NEXT_PUBLIC_INSFORGE_URL or INSFORGE_SERVICE_KEY");
}

/**
 * Server-only InsForge client using the service role key.
 * Bypasses RLS — never expose this to the browser.
 */
export const insforgeServer = createClient({
  baseUrl: insforgeUrl,
  accessToken: insforgeServiceKey,
});
