// scripts/check-insforge.mjs
//
// Verifies the InsForge project is reachable using the values in
// .env.local. Run with: node --env-file=.env.local scripts/check-insforge.mjs
//
// This uses Node's native --env-file flag instead of a hand-rolled parser,
// so it correctly handles comments, blank lines, and quoting without any
// custom logic that could silently misread the file.

async function main() {
  const url = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  console.log("[check-insforge] Loaded environment values:");
  console.log(`[check-insforge]   NEXT_PUBLIC_INSFORGE_URL = ${url ?? "(not set)"}`);
  console.log(`[check-insforge]   NEXT_PUBLIC_INSFORGE_ANON_KEY = ${anonKey ? anonKey.slice(0, 12) + "..." : "(not set)"}`);

  if (!url) {
    console.error("\n[check-insforge] NEXT_PUBLIC_INSFORGE_URL is not set.");
    console.error("[check-insforge] Did you run this with --env-file=.env.local ?");
    process.exit(1);
  }

  if (!anonKey) {
    console.error("\n[check-insforge] NEXT_PUBLIC_INSFORGE_ANON_KEY is not set.");
    console.error("[check-insforge] Did you run this with --env-file=.env.local ?");
    process.exit(1);
  }

  console.log(`\n[check-insforge] Checking reachability for: ${url}`);

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (response.ok || response.status === 404) {
      console.log(`[check-insforge] Reachable. HTTP ${response.status}.`);
      process.exit(0);
    }

    if (response.status === 401 || response.status === 403) {
      console.error(`[check-insforge] Reached the server, but the anon key was rejected (HTTP ${response.status}).`);
      console.error("[check-insforge] Double-check NEXT_PUBLIC_INSFORGE_ANON_KEY against the dashboard — copy the FULL key, not a truncated version.");
      process.exit(1);
    }

    console.error(`[check-insforge] Unexpected response: HTTP ${response.status}.`);
    const text = await response.text().catch(() => "");
    if (text) console.error(`[check-insforge] Response body: ${text.slice(0, 300)}`);
    process.exit(1);
  } catch (error) {
    console.error("[check-insforge] Could not reach the InsForge project at all.");
    console.error(`[check-insforge] ${error instanceof Error ? error.message : String(error)}`);
    console.error("[check-insforge] Check NEXT_PUBLIC_INSFORGE_URL is correct and that you have an internet connection.");
    process.exit(1);
  }
}

main();
