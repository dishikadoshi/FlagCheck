// One-time (or re-run-safe) seed script: pushes backend/puzzles.js into the
// Supabase `puzzles` table. Safe to re-run — it upserts on the `slug` column.
//
// Usage:
//   cd backend
//   npm install
//   node seed.js

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PUZZLES } from "./puzzles.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Copy backend/.env.example to backend/.env and fill them in first."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: skills, error: skillsErr } = await supabase.from("skills").select("id, name");
  if (skillsErr) throw skillsErr;
  const skillIdByName = Object.fromEntries((skills || []).map((s) => [s.name, s.id]));

  let upserted = 0;
  for (const p of PUZZLES) {
    const row = {
      slug: p.id,
      skill_id: skillIdByName[p.skill] || null,
      title: p.title,
      difficulty: p.difficulty || "medium",
      messages: p.messages,
      target_person: p.targetPerson,
      verdict: p.verdict,
      explanation: p.explanation,
      status: "published",
    };
    const { error } = await supabase.from("puzzles").upsert(row, { onConflict: "slug" });
    if (error) {
      console.error(`Failed to upsert ${p.id}:`, error.message);
      continue;
    }
    upserted += 1;
  }

  console.log(`Seeded ${upserted}/${PUZZLES.length} puzzles.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
