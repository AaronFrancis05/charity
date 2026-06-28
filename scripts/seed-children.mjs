// scripts/seed-children.mjs
//
// Seeds 10 child profiles into the database with realistic Ugandan data.
//
//   node --env-file=.env.local scripts/seed-children.mjs
//
// Idempotent — exits cleanly if 10+ active children already exist.

import { createClient } from "@insforge/sdk";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`[seed-children] Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function toDate(age) {
  const year = new Date().getFullYear() - age;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CHILDREN = [
  {
    name: "Nakato Grace",
    age: 12,
    region: "Kampala",
    goal_monthly_ugx: 250000,
    narrative:
      "Grace lives in Kampala with her grandmother after losing both parents. She loves mathematics and dreams of becoming a nurse. Despite financial hardship, she walks 5 km to school every day and ranks in the top five of her class.",
  },
  {
    name: "Okello Peter",
    age: 14,
    region: "Gulu",
    goal_monthly_ugx: 180000,
    narrative:
      "Peter is the eldest of four children in a family displaced by conflict. He helps his mother sell vegetables at the market before school each morning. He wants to be a teacher and has built a small library from donated books for neighbourhood children.",
  },
  {
    name: "Nantongo Sarah",
    age: 10,
    region: "Jinja",
    goal_monthly_ugx: 320000,
    narrative:
      "Sarah lives with her aunt near the Nile river. Her father passed away and her mother works as a domestic helper in Kampala. Sarah is passionate about art and reading. Her favourite subject is English, and she writes short stories about her community.",
  },
  {
    name: "Mwanga Daniel",
    age: 16,
    region: "Mbale",
    goal_monthly_ugx: 400000,
    narrative:
      "Daniel is a talented footballer who captains his school team. He supports his younger siblings after their father lost his job due to illness. Daniel maintains excellent grades and hopes to earn a sports scholarship to study engineering at university.",
  },
  {
    name: "Kyomugisha Patricia",
    age: 8,
    region: "Mbarara",
    goal_monthly_ugx: 150000,
    narrative:
      "Patricia is the youngest of six children in a farming family. She enjoys singing in the church choir and helping her mother tend the family garden. Her teachers describe her as curious and hardworking. She wants to be a doctor when she grows up.",
  },
  {
    name: "Wasswa Robert",
    age: 13,
    region: "Kampala",
    goal_monthly_ugx: 280000,
    narrative:
      "Robert lost his sight at age seven due to untreated measles. He attends a special needs school where he excels in braille literacy and mathematics. Despite his disability, Robert is one of the happiest children you will meet and dreams of becoming a lawyer.",
  },
  {
    name: "Nabaweesi Ruth",
    age: 11,
    region: "Other",
    goal_monthly_ugx: 200000,
    narrative:
      "Ruth comes from a remote fishing village on Lake Kyoga. Her father is a fisherman and her mother makes charcoal for sale. Ruth walks 8 km to the nearest primary school. She loves geography and wants to become a tour guide to show visitors the beauty of Uganda.",
  },
  {
    name: "Ssempijja John",
    age: 15,
    region: "Jinja",
    goal_monthly_ugx: 350000,
    narrative:
      "John was orphaned at age ten and now lives with an elderly uncle who struggles to provide for him. He started a small bicycle repair business to pay for his school supplies. John is determined to complete his education and become a mechanical engineer.",
  },
  {
    name: "Nakandi Maria",
    age: 9,
    region: "Gulu",
    goal_monthly_ugx: 220000,
    narrative:
      "Maria was separated from her family during displacement and now lives in a children's home. She is shy at first but opens up through music and dance. Maria loves learning new songs and dreams of becoming a singer. She is in Primary Four and improving every term.",
  },
  {
    name: "Kato Samuel",
    age: 7,
    region: "Mbale",
    goal_monthly_ugx: 500000,
    narrative:
      "Samuel was born with a cleft lip that was surgically repaired at age three. He is energetic and loves playing football with his friends. Samuel lives with both parents who are subsistence farmers. He started Primary One this year and already knows how to count to 100.",
  },
];

async function main() {
  const insforgeUrl = requireEnv("NEXT_PUBLIC_INSFORGE_URL");
  const serviceKey = requireEnv("INSFORGE_SERVICE_KEY");

  const svc = createClient({ baseUrl: insforgeUrl, accessToken: serviceKey });

  // 1. Check if children already exist (idempotent)
  const { data: existing, error: countError } = await svc.database
    .from("children_profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (countError) {
    console.error("[seed-children] Failed to count existing children:", countError.message);
    process.exit(1);
  }

  if (existing && existing.length >= 10) {
    console.log(`[seed-children] ${existing.length} active children already exist — nothing to do.`);
    process.exit(0);
  }

  // 2. Get a super_admin UUID for created_by
  const { data: admin } = await svc.database
    .from("admins")
    .select("id")
    .eq("role", "super_admin")
    .limit(1)
    .single();

  if (!admin) {
    console.error("[seed-children] No super_admin found. Run seed-super-admin.mjs first.");
    process.exit(1);
  }

  console.log(`[seed-children] Found admin ${admin.id}. Inserting ${CHILDREN.length} children...`);

  let inserted = 0;
  for (const child of CHILDREN) {
    const record = {
      name: child.name,
      date_of_birth: toDate(child.age),
      region: child.region,
      narrative: child.narrative,
      goal_monthly_ugx: child.goal_monthly_ugx,
      profile_image_url: `https://placehold.co/400x500?text=${encodeURIComponent(child.name)}`,
      video_url: null,
      is_active: true,
      created_by: admin.id,
    };

    const { error } = await svc.database.from("children_profiles").insert([record]);

    if (error) {
      console.error(`[seed-children] Failed to insert ${child.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${child.name} (${child.region}, UGX ${child.goal_monthly_ugx.toLocaleString("en-UG")}/mo)`);
      inserted++;
    }
  }

  console.log(`[seed-children] Done. Inserted ${inserted}/${CHILDREN.length} children.`);

  if (inserted === 0) {
    console.error("[seed-children] No children were inserted. Check errors above.");
    process.exit(1);
  }

  console.log("[seed-children] Visit /sponsor to see the profiles.");
}

main().catch((error) => {
  console.error("[seed-children] Unexpected error:", error);
  process.exit(1);
});
