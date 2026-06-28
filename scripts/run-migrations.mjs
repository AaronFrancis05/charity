// scripts/run-migrations.mjs
//
// Applies pending SQL migrations against the InsForge database.
// Uses the service_role key to execute raw SQL via the management API.
//
//   node --env-file=.env.local scripts/run-migrations.mjs
//

const MIGRATIONS = [
  "migrations/20260629120000_add-admin-profile.sql",
  "migrations/20260629140000_add-admin-invite.sql",
];

async function main() {
  const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const serviceKey = process.env.INSFORGE_SERVICE_KEY;

  if (!insforgeUrl || !serviceKey) {
    console.error("[run-migrations] Missing NEXT_PUBLIC_INSFORGE_URL or INSFORGE_SERVICE_KEY");
    process.exit(1);
  }

  // Use the Supabase-compatible REST endpoint for raw SQL
  const sqlEndpoint = `${insforgeUrl.replace(/\/$/, "")}/rest/v1/rpc/`;

  for (const file of MIGRATIONS) {
    const { readFileSync, existsSync } = await import("fs");
    const path = await import("path");

    const fullPath = path.default.resolve(file);
    if (!existsSync(fullPath)) {
      console.log(`  ~ ${file} not found, skipping`);
      continue;
    }

    const sql = readFileSync(fullPath, "utf-8");
    console.log(`[run-migrations] Applying ${file}...`);

    try {
      // Try direct SQL via the REST API using a custom query
      const response = await fetch(`${insforgeUrl.replace(/\/$/, "")}/rest/v1/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (response.ok || response.status === 204) {
        console.log(`  ✓ ${file}`);
      } else {
        const text = await response.text();
        console.error(`  ✗ ${file}: ${response.status} ${text}`);
      }
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
    }
  }

  console.log("[run-migrations] Done.");
}

main().catch((err) => {
  console.error("[run-migrations] Fatal:", err);
  process.exit(1);
});
