// Storage smoke test — proves the `media` bucket's access rules and
// upload constraints actually hold, not just that they're configured.
//
// Same shape as scripts/rls-smoke-test.mjs: seed as service_role,
// then assert as anon and as a real authenticated user.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/storage-smoke-test.mjs

const URL_BASE = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !ANON_KEY || !SERVICE_KEY) {
  console.error(
    "Missing env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const BUCKET = "media";
const MARK = `smoke-${Date.now()}`;

// Smallest valid PNG (1x1, transparent) — real image bytes so the
// only thing under test is policy/limits, not file validity.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

const results = [];
function assert(name, passed, detail) {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}\n        ${detail}`);
}

async function upload(path, body, { key, contentType }) {
  const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${key}`,
      "Content-Type": contentType,
    },
    body,
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

// ---------------------------------------------------------------
// Seed a file as service_role (bypasses RLS via BYPASSRLS)
// ---------------------------------------------------------------
console.log("--- seeding as service_role ---");
const SEEDED_PATH = `${MARK}/seeded.png`;
{
  const r = await upload(SEEDED_PATH, PNG_1X1, {
    key: SERVICE_KEY,
    contentType: "image/png",
  });
  if (r.status !== 200) {
    console.error(
      `SEED FAILED  ${SEEDED_PATH}  (HTTP ${r.status})\n        ${JSON.stringify(r.body)}`,
    );
    console.error("\nAborting — later assertions would be ambiguous.");
    process.exit(1);
  }
  console.log(`seeded  ${BUCKET}/${SEEDED_PATH}  (HTTP ${r.status})`);
}

// ---------------------------------------------------------------
// Create + sign in a real user, so "authenticated" means a genuine
// end-user JWT, not the service key (which bypasses RLS entirely
// and would prove nothing about the policies).
// ---------------------------------------------------------------
const TEST_EMAIL = `${MARK}@example.com`;
const TEST_PASSWORD = "smoke-test-password-123";
let userToken;
{
  const created = await fetch(`${URL_BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    }),
  });
  if (!created.ok) {
    console.error(
      `Could not create test user (HTTP ${created.status}): ${await created.text()}`,
    );
    process.exit(1);
  }

  const signedIn = await fetch(
    `${URL_BASE}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    },
  );
  const session = await signedIn.json();
  userToken = session.access_token;
  if (!userToken) {
    console.error(`Could not sign in test user: ${JSON.stringify(session)}`);
    process.exit(1);
  }
  console.log(`authenticated as ${TEST_EMAIL}`);
}

// ---------------------------------------------------------------
console.log("\n--- assertions ---");

// 1. Public read: the bucket is public, so the object URL serves
// without auth — this is how the site will actually load images.
{
  const res = await fetch(
    `${URL_BASE}/storage/v1/object/public/${BUCKET}/${SEEDED_PATH}`,
  );
  const bytes = res.ok ? (await res.arrayBuffer()).byteLength : 0;
  assert(
    "anon can read a seeded file",
    res.status === 200 && bytes > 0,
    `HTTP ${res.status}, ${bytes} byte(s)`,
  );
}

// 2. anon must not be able to write.
{
  const r = await upload(`${MARK}/anon-illegal.png`, PNG_1X1, {
    key: ANON_KEY,
    contentType: "image/png",
  });
  const rejected = r.status === 400 || r.status === 401 || r.status === 403;
  assert(
    "anon cannot upload",
    rejected,
    `HTTP ${r.status}` +
      (rejected
        ? ` (${r.body?.error ?? r.body?.message ?? "rejected"})`
        : " — UPLOAD WAS ALLOWED"),
  );
}

// 3. A genuine authenticated user can write.
{
  const r = await upload(`${MARK}/authed.png`, PNG_1X1, {
    key: userToken,
    contentType: "image/png",
  });
  assert(
    "authenticated can upload",
    r.status === 200,
    `HTTP ${r.status}` +
      (r.status === 200 ? "" : ` — ${JSON.stringify(r.body)}`),
  );
}

// 4. Bucket-level size cap (2 MiB). Declared as image/jpeg — an
// ALLOWED mime type — so the rejection can only be about size.
{
  const tooBig = Buffer.alloc(3 * 1024 * 1024, 0x41);
  const r = await upload(`${MARK}/oversize.jpg`, tooBig, {
    key: userToken,
    contentType: "image/jpeg",
  });
  const rejected = r.status === 413 || r.status === 400;
  assert(
    "upload over 2MB is rejected at the bucket level",
    rejected,
    `HTTP ${r.status} (${(tooBig.length / 1024 / 1024).toFixed(0)}MB) ` +
      (rejected
        ? `— ${r.body?.error ?? r.body?.message ?? "rejected"}`
        : "— OVERSIZE UPLOAD WAS ALLOWED"),
  );
}

// 5. MIME allow-list. Small file, so the rejection can only be
// about type — this is the SVG/GIF exclusion being enforced.
{
  const r = await upload(`${MARK}/not-an-image.txt`, Buffer.from("hello"), {
    key: userToken,
    contentType: "text/plain",
  });
  const rejected = r.status === 400 || r.status === 415;
  assert(
    "non-image MIME type is rejected",
    rejected,
    `HTTP ${r.status} ` +
      (rejected
        ? `— ${r.body?.error ?? r.body?.message ?? "rejected"}`
        : "— NON-IMAGE UPLOAD WAS ALLOWED"),
  );
}

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
