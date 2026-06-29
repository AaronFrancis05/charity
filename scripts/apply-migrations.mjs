// scripts/apply-migrations.mjs
//
// Applies pending DDL migrations against the InsForge database.
// Uses the service_role key against the Supabase-compatible SQL REST API.
//
//   node --env-file=.env.local scripts/apply-migrations.mjs
//

async function main() {
  const url = (process.env.NEXT_PUBLIC_INSFORGE_URL || "").replace(/\/+$/, "");
  const key = process.env.INSFORGE_SERVICE_KEY;

  if (!url || !key) {
    console.error("[apply-migrations] Missing NEXT_PUBLIC_INSFORGE_URL or INSFORGE_SERVICE_KEY");
    process.exit(1);
  }

  const migration = `
    ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
    ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT '';
    ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS invite_token TEXT;
    ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS invite_token_expires_at TIMESTAMPTZ;
    ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS password_set BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE public.admins ALTER COLUMN password_hash DROP NOT NULL;
    ALTER TABLE public.donations_ledger ADD COLUMN IF NOT EXISTS donor_name TEXT;
  `;

  console.log("[apply-migrations] Running DDL on admins + donations_ledger tables...");

  try {
    const res = await fetch(`${url}/rest/v1/rpc/pg_query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({ query_text: migration }),
    });

    const body = await res.text();
    if (res.ok || res.status === 200 || res.status === 204) {
      console.log("  ✓ Migration applied successfully");
    } else {
      console.log(`  ? API responded ${res.status}: ${body.slice(0, 300)}`);
      console.log("  Trying alternative endpoint...");
      tryAlternative(url, key, migration);
    }
  } catch (err) {
    console.log(`  ? ${err.message}`);
    console.log("  Trying alternative endpoint...");
    tryAlternative(url, key, migration);
  }
}

async function tryAlternative(url, key, sql) {
  try {
    // Try the main REST endpoint with Prefer header (PostgREST raw SQL)
    const res = await fetch(`${url}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Prefer": "params=single-object",
      },
      body: JSON.stringify({ query: sql }),
    });
    const body = await res.text();
    if (res.ok || res.status === 200 || res.status === 201 || res.status === 204) {
      console.log("  ✓ Migration applied successfully");
      process.exit(0);
    } else {
      console.log(`  ✗ Alternative also failed: ${res.status} ${body.slice(0, 200)}`);
      manualInstructions();
    }
  } catch (err) {
    console.log(`  ✗ Alternative failed: ${err.message}`);
    manualInstructions();
  }
}

function manualInstructions() {
  console.log("");
  console.log("  ── Manual migration required ──");
  console.log("  Run this SQL in your InsForge/Supabase dashboard SQL editor:");
  console.log("");
  console.log("  ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';");
  console.log("  ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT '';");
  console.log("  ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS invite_token TEXT;");
  console.log("  ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS invite_token_expires_at TIMESTAMPTZ;");
  console.log("  ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS password_set BOOLEAN NOT NULL DEFAULT false;");
  console.log("  ALTER TABLE public.admins ALTER COLUMN password_hash DROP NOT NULL;");
  console.log("  ALTER TABLE public.donations_ledger ADD COLUMN IF NOT EXISTS donor_name TEXT;");
  console.log("");
  process.exit(1);
}

main().catch((err) => {
  console.error("[apply-migrations] Fatal:", err);
  process.exit(1);
});
