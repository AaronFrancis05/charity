// test-raw-fetch.mjs — temporary diagnostic, delete after use
//
// Tests the raw InsForge REST endpoint directly, bypassing both
// @supabase/supabase-js and @insforge/ssr entirely, to confirm whether
// /rest/v1/ is actually the correct base path for this InsForge project.
//
// Run with: node --env-file=.env.local test-raw-fetch.mjs

const url = process.env.NEXT_PUBLIC_INSFORGE_URL;
const key = process.env.INSFORGE_SERVICE_KEY;

console.log("Testing URL:", url);
console.log("Key present:", key ? `yes (${key.slice(0, 8)}...)` : "NO - MISSING");
console.log("");

const pathsToTry = [
  "/rest/v1/admins",
  "/rest/v1/admins?select=id",
  "/api/admins",
  "/v1/admins",
  "/database/admins",
];

for (const path of pathsToTry) {
  try {
    const res = await fetch(`${url}${path}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    const text = await res.text();
    const preview = text.slice(0, 150).replace(/\n/g, " ");
    console.log(`${path} -> HTTP ${res.status} -> ${preview}`);
  } catch (err) {
    console.log(`${path} -> FETCH ERROR -> ${err.message}`);
  }
}
