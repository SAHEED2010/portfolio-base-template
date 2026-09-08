// RLS smoke test — proves the policies actually work, not just that
// they exist. Seeds one row per table as service_role, then runs a
// fixed set of assertions as an ANONYMOUS client (anon key).
//
// Uses plain fetch against PostgREST rather than @supabase/supabase-js
// on purpose: no new dependency, and it exercises the exact HTTP path
// the app will use, so RLS behaviour is observed rather than mediated
// by a client library.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/rls-smoke-test.mjs

const URL_BASE = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !ANON_KEY || !SERVICE_KEY) {  
  console.error(
    "Missing env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY", 
  );
  process.exit(1);
}

const rest = (path) => `${URL_BASE}/rest/v1/${path}`;

async function req(method, path, { key, body, prefer } = {}) {
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;

  const res = await fetch(rest(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: res.status, ok: res.ok, body: parsed };
}

// A distinct marker so seeded rows are identifiable and re-runs are
// visibly separate.
const MARK = `smoke-${Date.now()}`;

const SEEDS = {
  site_settings: { key: `${MARK}_heading`, value: "Smoke Test Heading" },
  skills: { name: `${MARK} skill`, display_order: 0 },
  experiences: {
    title: `${MARK} role`,
    org: "Smoke Org",
    start_date: "2020-01-01",
    type: "work",
  },
  works: { title: `${MARK} work`, external_url: "https://example.com" },
  testimonials: { name: `${MARK} client`, quote: "Great work.", rating: 5 },
  stats: { label: `${MARK} stat`, number: "50+" },
  contact_messages: {
    name: `${MARK} sender`,
    email: "smoke@example.com",
    message: "Seeded message.",
  },
};

const PUBLIC_READ_TABLES = [
  "site_settings",
  "skills",
  "experiences",
  "works",
  "testimonials",
  "stats",
];

const results = [];
function assert(name, passed, detail) {
  results.push({ name, passed, detail });
  console.log(
    `${passed ? "PASS" : "FAIL"}  ${name}\n        ${detail}`,
  );
}

// ---------------------------------------------------------------
// Seed as service_role (bypasses RLS via the BYPASSRLS attribute)
// ---------------------------------------------------------------
console.log("--- seeding as service_role ---");
let seedFailed = false;
for (const [table, row] of Object.entries(SEEDS)) {
  const r = await req("POST", table, {
    key: SERVICE_KEY,
    body: row,
    prefer: "return=representation",
  });
  const ok = r.status === 201;
  console.log(
    `${ok ? "seeded" : "SEED FAILED"}  ${table}  (HTTP ${r.status})` +
      (ok ? "" : `\n        ${JSON.stringify(r.body)}`),
  );
  if (!ok) seedFailed = true;
}

if (seedFailed) {
  console.error(
    "\nSeeding failed — aborting before assertions, since empty tables " +
      "would make SELECT results ambiguous.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------
// Assertions as anon
// ---------------------------------------------------------------
console.log("\n--- assertions as anon ---");

// 1-6. Public SELECT on the six public-read tables must succeed AND
// return rows (a 200 with [] would not distinguish "allowed" from
// "blocked by RLS", which is why we seeded first).
for (const table of PUBLIC_READ_TABLES) {
  const r = await req("GET", `${table}?select=*`, { key: ANON_KEY });
  const rows = Array.isArray(r.body) ? r.body.length : 0;
  assert(
    `anon SELECT ${table} succeeds and returns rows`,
    r.status === 200 && rows > 0,
    `HTTP ${r.status}, ${rows} row(s)`,
  );
}

// 7. contact_messages must NOT be readable by anon. With RLS and no
// SELECT policy for anon, PostgREST returns 200 with [] (RLS filters
// rows rather than erroring) — so "empty" is the expected pass here.
{
  const r = await req("GET", "contact_messages?select=*", { key: ANON_KEY });
  const rows = Array.isArray(r.body) ? r.body.length : 0;
  const blocked = r.status === 401 || r.status === 403;
  const empty = r.status === 200 && rows === 0;
  assert(
    "anon SELECT contact_messages is blocked or empty",
    blocked || empty,
    `HTTP ${r.status}, ${rows} row(s) — ${
      blocked ? "rejected" : empty ? "empty (RLS filtered)" : "LEAKED ROWS"
    }`,
  );
}

// 8. The public contact form path: anon INSERT must succeed.
{
  const r = await req("POST", "contact_messages", {
    key: ANON_KEY,
    body: {
      name: `${MARK} anon sender`,
      email: "anon@example.com",
      message: "Sent as anon.",
    },
  });
  assert(
    "anon INSERT contact_messages succeeds",
    r.status === 201,
    `HTTP ${r.status}` +
      (r.status === 201 ? "" : ` — ${JSON.stringify(r.body)}`),
  );
}

// 9. anon must NOT be able to delete inbox rows.
//
// Careful: PostgREST returns 204 here, NOT a 4xx. RLS filters the
// target rows down to zero, so the DELETE "succeeds" against nothing.
// Asserting on the status code would wrongly conclude anon can
// delete — the only meaningful assertion is that the row survives.
{
  const before = await req(
    "GET",
    `contact_messages?select=id&name=eq.${encodeURIComponent(SEEDS.contact_messages.name)}`,
    { key: SERVICE_KEY },
  );
  await req(
    "DELETE",
    `contact_messages?name=eq.${encodeURIComponent(SEEDS.contact_messages.name)}`,
    { key: ANON_KEY },
  );
  const after = await req(
    "GET",
    `contact_messages?select=id&name=eq.${encodeURIComponent(SEEDS.contact_messages.name)}`,
    { key: SERVICE_KEY },
  );

  const survived =
    Array.isArray(before.body) &&
    Array.isArray(after.body) &&
    before.body.length > 0 &&
    before.body.length === after.body.length;

  assert(
    "anon DELETE on contact_messages removes nothing",
    survived,
    `rows before ${Array.isArray(before.body) ? before.body.length : "?"}, ` +
      `after ${Array.isArray(after.body) ? after.body.length : "?"}` +
      (survived ? " — row survived" : " — ROW WAS DELETED"),
  );
}

// 10. anon must NOT be able to write to a public-read table.
{
  const r = await req("POST", "works", {
    key: ANON_KEY,
    body: { title: `${MARK} illegal`, external_url: "https://example.com" },
  });
  const rejected = r.status === 401 || r.status === 403;
  assert(
    "anon INSERT works is rejected",
    rejected,
    `HTTP ${r.status}` +
      (rejected
        ? ` (${r.body?.code ?? "no code"})`
        : " — WRITE WAS ALLOWED"),
  );
}

// ---------------------------------------------------------------
// Clean up every row this run created.
//
// Not optional housekeeping: FORKING.md has you run this against the
// CLIENT'S live project to verify their RLS. Without cleanup, that
// check would leave "smoke-…" cards on a real portfolio.
//
// Runs as service_role because anon deliberately cannot delete most
// of this — that's the property the test just proved.
// ---------------------------------------------------------------
async function cleanup() {
  const targets = [
    ["site_settings", "key"],
    ["skills", "name"],
    ["experiences", "title"],
    ["works", "title"],
    ["testimonials", "name"],
    ["stats", "label"],
    ["contact_messages", "name"],
  ];

  for (const [table, column] of targets) {
    const r = await req(
      "DELETE",
      `${table}?${column}=like.${encodeURIComponent(`${MARK}*`)}`,
      { key: SERVICE_KEY },
    );
    if (r.status !== 204 && r.status !== 200) {
      console.warn(`  ! cleanup of ${table} returned HTTP ${r.status}`);
    }
  }
}

console.log("\n--- cleanup ---");
await cleanup();
console.log(`removed rows tagged ${MARK}`);

// ---------------------------------------------------------------
const failed = results.filter((r) => !r.passed);
console.log(
  `\n${results.length - failed.length}/${results.length} assertions passed`,
);
if (failed.length) {
  console.log("Failed:");
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
