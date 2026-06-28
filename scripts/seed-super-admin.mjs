// scripts/seed-super-admin.mjs
//
// Provisions (or updates) the first super_admin record per build-plan.md
// node 02. Run with:
//
//   node --env-file=.env.local scripts/seed-super-admin.mjs
//
// Required environment variables (set these temporarily, do not commit):
//   SEED_ADMIN_EMAIL       - the admin's login email
//   SEED_ADMIN_PASSWORD    - the admin's plaintext password (hashed locally,
//                            never sent or logged in plaintext)
//
// Already-present in .env.local:
//   NEXT_PUBLIC_INSFORGE_URL
//   INSFORGE_SERVICE_KEY
//
// This script is idempotent — running it twice with the same email updates
// the existing row's password_hash rather than creating a duplicate admin.

import bcrypt from "bcryptjs";
import { createClient } from "@insforge/sdk";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`[seed-super-admin] Missing required environment variable: ${name}`);
    console.error(`[seed-super-admin] Set it before running, e.g.:`);
    console.error(`[seed-super-admin]   $env:${name} = "..."`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const insforgeUrl = requireEnv("NEXT_PUBLIC_INSFORGE_URL");
  const serviceKey = requireEnv("INSFORGE_SERVICE_KEY");
  const email = requireEnv("SEED_ADMIN_EMAIL");
  const password = requireEnv("SEED_ADMIN_PASSWORD");

  if (password.length < 8) {
    console.error("[seed-super-admin] Password must be at least 8 characters (AdminLoginSchema requirement).");
    process.exit(1);
  }

  console.log(`[seed-super-admin] Hashing password for ${email}...`);
  const passwordHash = await bcrypt.hash(password, 10);

  // Sanity check on the hash we just produced, before it ever touches the DB.
  if (passwordHash.length !== 60 || !passwordHash.startsWith("$2")) {
    console.error("[seed-super-admin] Generated hash does not look like a valid bcrypt hash. Aborting.");
    console.error(`[seed-super-admin] Hash length was: ${passwordHash.length} (expected 60).`);
    process.exit(1);
  }

  const svc = createClient({ baseUrl: insforgeUrl, accessToken: serviceKey });

  const { data: existing, error: lookupError } = await svc.database
    .from("admins")
    .select("id, email")
    .eq("email", email)
    .single();

  if (lookupError && !lookupError.message?.includes("multiple (or no) rows")) {
    console.error("[seed-super-admin] Failed to query admins table:", lookupError.message);
    process.exit(1);
  }

  if (existing) {
    console.log(`[seed-super-admin] Existing admin found (id: ${existing.id}). Updating password_hash...`);

    const { error: updateError } = await svc.database
      .from("admins")
      .update({
        password_hash: passwordHash,
        role: "super_admin",
        is_active: true,
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("[seed-super-admin] Failed to update admin record:", updateError.message);
      process.exit(1);
    }

    console.log("[seed-super-admin] Updated existing super_admin record successfully.");
  } else {
    console.log("[seed-super-admin] No existing admin found. Creating new super_admin record...");

    const { error: insertError } = await svc.database.from("admins").insert([{
      email,
      password_hash: passwordHash,
      role: "super_admin",
      is_active: true,
    }]);

    if (insertError) {
      console.error("[seed-super-admin] Failed to insert admin record:", insertError.message);
      process.exit(1);
    }

    console.log("[seed-super-admin] Created new super_admin record successfully.");
  }

  console.log("[seed-super-admin] Done. You can now log in at /admin/login.");
  console.log("[seed-super-admin] Remember to clear SEED_ADMIN_PASSWORD from your shell session.");
}

main().catch((error) => {
  console.error("[seed-super-admin] Unexpected error:", error);
  process.exit(1);
});
