// Flags any seeded content still sitting on a live site.
//
// The base's seed data is written to be REALISTIC ("Mara Ellison", a
// real-sounding project called "Meridian", a plausible client quote)
// so a fresh fork looks like a finished site rather than an empty
// shell. That realism is exactly what makes it dangerous: unlike
// "Sample Project 1", nothing about it LOOKS wrong at a glance, so it
// can survive to launch unnoticed. This check is what makes the
// realistic seeding safe — see DECISIONS.md.
//
// Compares live content against scripts/seed-manifest.json (generated
// from supabase/seed.sql by generate-seed-manifest.mjs) and reports
// every site_settings key still holding its exact seeded value, and
// every content-table row that still matches a seeded row.
//
// Read-only. Run before every launch — see FORKING.md.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/check-seed-drift.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  readFileSync(join(__dirname, "seed-manifest.json"), "utf-8"),
);

const URL_BASE = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!URL_BASE || !ANON_KEY) {
  console.error("Missing env: SUPABASE_URL, SUPABASE_ANON_KEY");
  process.exit(1);
}

async function get(path) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} -> HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// NOT JSON.stringify comparison — Postgres jsonb normalizes object
// key order on the way back out (observed: {label, url, primary} as
// inserted comes back {url, label, primary}), so a string comparison
// silently fails to flag content that is semantically identical to
// the seed. That's a false negative in exactly the direction that
// matters: it would have made contact_channels and social_links
// permanently invisible to this check. Arrays stay order-sensitive
// (hero_phrases order and which contact_channels entry is primary
// are both meaningful); object KEY order does not matter.
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    return a.every((item, i) => deepEqual(item, b[i]));
  }

  if (typeof a === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(a[key], b[key]));
  }

  return false;
}

const flagged = [];

// --- site_settings: every key still equal to its seeded value ------
console.log(`Checking ${Object.keys(manifest.site_settings).length} site_settings keys…`);
const liveSettings = await get("site_settings?select=key,value");
const liveByKey = Object.fromEntries(liveSettings.map((r) => [r.key, r.value]));

for (const [key, seedValue] of Object.entries(manifest.site_settings)) {
  if (deepEqual(liveByKey[key], seedValue)) {
    flagged.push(`site_settings.${key}`);
  }
}

// --- content tables: any row matching a seeded row on its
// identifying columns ------------------------------------------------
const TABLES = [
  ["skills", "name"],
  ["experiences", "title,org,start_date"],
  ["works", "title,external_url"],
  ["testimonials", "name,quote"],
  ["stats", "label,number"],
];

for (const [table, select] of TABLES) {
  const seedRows = manifest[table];
  console.log(`Checking ${seedRows.length} ${table} row(s)…`);
  const liveRows = await get(`${table}?select=${select}`);

  for (const seedRow of seedRows) {
    const match = liveRows.some((liveRow) =>
      Object.keys(seedRow).every((col) => liveRow[col] === seedRow[col]),
    );
    if (match) {
      const identity = Object.values(seedRow)[0];
      flagged.push(`${table}: "${identity}"`);
    }
  }
}

console.log("");
if (flagged.length === 0) {
  console.log("✓ No seeded content detected. Clear to launch.");
  process.exit(0);
}

console.log(`⚠ ${flagged.length} item(s) still hold seeded content:\n`);
for (const item of flagged) console.log(`  - ${item}`);
console.log(
  "\nReplace these with the client's real content before this site goes live.",
);
process.exit(1);
