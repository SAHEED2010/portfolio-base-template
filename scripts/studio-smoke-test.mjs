// Studio smoke test — proves the authenticated edit path actually
// writes, for EVERY list table, rather than merely rendering.
//
// It exists because of a real regression: wrapping useActionState's
// dispatch in an arrow function turned an edit form into a CLIENT
// action. React then rendered
//   action="javascript:throw new Error('React form unexpectedly submitted.')"
// and the submit never reached the server — the action was invoked
// zero times while the page looked completely fine. Type-checks,
// lint, build and "the page renders" all passed throughout.
//
// The "is a SERVER action" assertion below is the guard for exactly
// that, and it now runs against all five tables. Run this after
// touching any studio form.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
//   APP_URL=http://127.0.0.1:3000 node scripts/studio-smoke-test.mjs

import { createServerClient } from "@supabase/ssr";

const URL_BASE = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP = process.env.APP_URL ?? "http://127.0.0.1:3000";

if (!URL_BASE || !ANON_KEY || !SERVICE_KEY) {
  console.error(
    "Missing env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const MARK = `studio-${Date.now()}`;
const EMAIL = `${MARK}@example.com`;
const PASSWORD = "studio-smoke-password-123";

const results = [];
const check = (name, passed, detail) => {
  results.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}\n        ${detail}`);
};

const admin = (path, init = {}) =>
  fetch(`${URL_BASE}${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");

// One spec per table. `label` is the column the edit changes and the
// assertion reads back.
const TABLES = [
  {
    table: "works",
    route: "works",
    label: "title",
    seed: { title: `${MARK} work`, external_url: "https://example.com" },
    edit: { subtitle: "", external_url: "https://example.com", image_url: "" },
    invalid: { title: "", external_url: "not-a-url", image_url: "" },
  },
  {
    table: "skills",
    route: "skills",
    label: "name",
    seed: { name: `${MARK} skill` },
    edit: {},
    invalid: { name: "" },
  },
  {
    table: "stats",
    route: "stats",
    label: "label",
    seed: { label: `${MARK} stat`, number: "50+" },
    edit: { number: "60+" },
    invalid: { label: "", number: "" },
  },
  {
    table: "testimonials",
    route: "testimonials",
    label: "name",
    seed: { name: `${MARK} client`, quote: "Great work." },
    edit: { quote: "Great work.", rating: "", avatar_url: "" },
    // rating 9 is out of the 1-5 range the schema enforces
    invalid: { name: "", quote: "", rating: "9", avatar_url: "" },
  },
  {
    table: "experiences",
    route: "experiences",
    label: "title",
    seed: {
      title: `${MARK} role`,
      org: "Smoke Org",
      start_date: "2020-01-01",
    },
    edit: {
      org: "Smoke Org",
      start_date: "2020-01-01",
      end_date: "",
      type: "",
      description: "",
      logo_url: "",
    },
    // end_date before start_date exercises the cross-field refine
    invalid: {
      title: "",
      org: "",
      start_date: "2020-01-01",
      end_date: "2019-01-01",
      type: "",
      description: "",
      logo_url: "",
    },
  },
];

// --- setup: throwaway admin user ----------------------------------
const createdUser = await admin("/auth/v1/admin/users", {
  method: "POST",
  body: JSON.stringify({ email: EMAIL, password: PASSWORD, email_confirm: true }),
});
if (!createdUser.ok) {
  console.error(`Could not create test user: ${await createdUser.text()}`);
  process.exit(1);
}
const userId = (await createdUser.json()).id;

const jar = new Map();
const supabase = createServerClient(URL_BASE, ANON_KEY, {
  cookies: {
    getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
    setAll: (l) => l.forEach(({ name, value }) => jar.set(name, value)),
  },
});
const { error: signInError } = await supabase.auth.signInWithPassword({
  email: EMAIL,
  password: PASSWORD,
});
if (signInError) {
  console.error(`Sign in failed: ${signInError.message}`);
  process.exit(1);
}
const cookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

console.log("--- access control ---");
{
  const res = await fetch(`${APP}/studio/works`, { redirect: "manual" });
  check(
    "unauthenticated studio is redirected to login",
    res.status === 307 &&
      (res.headers.get("location") ?? "").includes("/studio/login"),
    `HTTP ${res.status} -> ${res.headers.get("location")}`,
  );
}

const seededIds = [];

for (const spec of TABLES) {
  console.log(`\n--- ${spec.table} ---`);

  const created = await admin(`/rest/v1/${spec.table}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...spec.seed, display_order: 9999 }),
  });
  if (!created.ok) {
    check(`${spec.table}: seed row`, false, await created.text());
    continue;
  }
  const row = (await created.json())[0];
  seededIds.push([spec.table, row.id]);

  const pageUrl = `${APP}/studio/${spec.route}/${row.id}`;
  const html = await (await fetch(pageUrl, { headers: { cookie } })).text();
  const anchor = html.indexOf("flex max-w-2xl");
  const start = html.lastIndexOf("<form", anchor);
  const frag =
    start === -1 ? "" : html.slice(start, html.indexOf("</form>", start) + 7);
  const openTag = frag.match(/<form[^>]*>/)?.[0] ?? "";

  // THE REGRESSION GUARD.
  const clientAction = /javascript:throw/.test(openTag);
  check(
    `${spec.table}: edit form is a SERVER action`,
    /method="POST"/i.test(openTag) && !clientAction,
    clientAction
      ? "action=javascript:throw — dispatch was wrapped; submits will never reach the server"
      : openTag.slice(0, 88),
  );

  const actionFields = [
    ...frag.matchAll(
      /<input type="hidden" name="(\$ACTION[^"]*)"(?: value="([^"]*)")?\s*\/>/g,
    ),
  ].map(([, name, value]) => [name, decode(value ?? "")]);

  const build = (fields) => {
    const fd = new FormData();
    for (const [n, v] of actionFields) fd.set(n, v);
    fd.set("id", row.id);
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    return fd;
  };

  // A valid edit must reach Postgres.
  const edited = `${MARK} edited`;
  await fetch(pageUrl, {
    method: "POST",
    headers: { cookie },
    body: build({ ...spec.edit, [spec.label]: edited }),
    redirect: "manual",
  });
  const afterValid = await (
    await admin(`/rest/v1/${spec.table}?select=${spec.label}&id=eq.${row.id}`)
  ).json();
  check(
    `${spec.table}: valid edit reaches Postgres`,
    afterValid[0]?.[spec.label] === edited,
    `stored ${JSON.stringify(afterValid[0]?.[spec.label])}`,
  );

  // Invalid input must be rejected and must not write.
  const badRes = await fetch(pageUrl, {
    method: "POST",
    headers: { cookie },
    body: build(spec.invalid),
    redirect: "manual",
  });
  const badBody = await badRes.text();
  const afterInvalid = await (
    await admin(`/rest/v1/${spec.table}?select=${spec.label}&id=eq.${row.id}`)
  ).json();
  const surfaced =
    /required|Enter a full URL|must be|Use a valid date|Invalid/i.test(badBody);
  check(
    `${spec.table}: invalid input rejected, row untouched`,
    surfaced && afterInvalid[0]?.[spec.label] === edited,
    `errors surfaced: ${surfaced}, value still ${JSON.stringify(afterInvalid[0]?.[spec.label])}`,
  );
}

// --- cleanup ------------------------------------------------------
console.log("\n--- cleanup ---");
for (const [table, id] of seededIds) {
  await admin(`/rest/v1/${table}?id=eq.${id}`, { method: "DELETE" });
}
await admin(`/auth/v1/admin/users/${userId}`, { method: "DELETE" });
console.log(`removed ${seededIds.length} test row(s) and user ${EMAIL}`);

const failed = results.filter((r) => !r.passed);
console.log(
  `\n${results.length - failed.length}/${results.length} assertions passed`,
);
if (failed.length) process.exit(1);
