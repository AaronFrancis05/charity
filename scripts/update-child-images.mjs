// scripts/update-child-images.mjs
//
// Updates existing child profile_image_url values to use local static images
// from public/images/children/ instead of placehold.co placeholder URLs.
//
//   node --env-file=.env.local scripts/update-child-images.mjs
//

import { createClient } from "@insforge/sdk";

const IMAGE_MAP = {
  "Nakato Grace": "grace.jpg",
  "Okello Peter": "joseph.jpg",
  "Nantongo Sarah": "amara.jpg",
  "Mwanga Daniel": "david.jpg",
  "Kyomugisha Patricia": "fatuma.jpg",
  "Wasswa Robert": "moses.jpg",
  "Nabaweesi Ruth": "ruth.jpg",
  "Ssempijja John": "john.jpg",
  "Nakandi Maria": "maria.jpg",
  "Kato Samuel": "samuel.jpg",
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`[update-child-images] Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const insforgeUrl = requireEnv("NEXT_PUBLIC_INSFORGE_URL");
  const serviceKey = requireEnv("INSFORGE_SERVICE_KEY");
  const svc = createClient({ baseUrl: insforgeUrl, accessToken: serviceKey });

  const { data: children, error } = await svc.database
    .from("children_profiles")
    .select("id, name, profile_image_url")
    .eq("is_active", true);

  if (error) {
    console.error("[update-child-images] Failed to fetch children:", error.message);
    process.exit(1);
  }

  if (!children || children.length === 0) {
    console.log("[update-child-images] No active children found.");
    process.exit(0);
  }

  let updated = 0;
  let skipped = 0;

  for (const child of children) {
    const filename = IMAGE_MAP[child.name];

    if (!filename) {
      console.log(`  ~ ${child.name} — no mapped image, skipping`);
      skipped++;
      continue;
    }

    const newUrl = `/images/children/${filename}`;

    if (child.profile_image_url === newUrl) {
      skipped++;
      continue;
    }

    const { error: updateError } = await svc.database
      .from("children_profiles")
      .update({ profile_image_url: newUrl })
      .eq("id", child.id);

    if (updateError) {
      console.error(`  ✗ ${child.name}: ${updateError.message}`);
    } else {
      console.log(`  ✓ ${child.name} → ${filename}`);
      updated++;
    }
  }

  console.log(`\n[update-child-images] Done. Updated ${updated}, skipped ${skipped}.`);
}

main().catch((error) => {
  console.error("[update-child-images] Unexpected error:", error);
  process.exit(1);
});
