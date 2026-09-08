// Studio smoke test — proves the authenticated edit path actually
// writes, rather than merely rendering.
//
// It exists because of a real regression: wrapping useActionState's
// dispatch in an arrow function turned the edit form into a CLIENT
// action. React then rendered
//   action="javascript:throw new Error('React form unexpectedly submitted.')"
// and the submit never reached the server — updateWork was invoked
// zero times while the page looked completely fine. Type-checks,
// lint, build and "the page renders" all passed throughout.
//
// Assertion 2 below is the guard for exactly that. Run this after
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
  s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'");

// --- set up: a throwaway admin user and a row to edit -------------
const createdUser = await admin("/auth/v1/admin/users", {
  method: "POST",
  body: JSON.stringify({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  }),
});
if (!createdUser.ok) {
  console.error(`Could not create test user: ${await createdUser.text()}`);
  process.exit(1);
}
const userId = (await createdUser.json()).id;

const seeded = await admin("/rest/v1/works", {
  method: "POST",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify({
    title: `${MARK} work`,
    external_url: "https://example.com",
    display_order: 9999,
  }),
});
const work = (await seeded.json())[0];

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
const pageUrl = `${APP}/studio/works/${work.id}`;

console.log("--- assertions ---");

// 1. The studio must not be reachable without a session.
{
  const res = await fetch(`${APP}/studio/works`, { redirect: "manual" });
  check(
    "unauthenticated /studio/works is redirected to login",
    res.status === 307 && (res.headers.get("location") ?? "").includes("/studio/login"),
    `HTTP ${res.status} -> ${res.headers.get("location")}`,
  );
}

const html = await (await fetch(pageUrl, { headers: { cookie } })).text();
const anchor = html.indexOf("flex max-w-2xl");
const start = html.lastIndexOf("<form", anchor);
const frag = start === -1 ? "" : html.slice(start, html.indexOf("</form>", start) + 7);
const openTag = frag.match(/<form[^>]*>/)?.[0] ?? "";

// 2. THE REGRESSION GUARD.
{
  const clientAction = /javascript:throw/.test(openTag);
  check(
    "edit form is a SERVER action, not a client function",
    /method="POST"/i.test(openTag) && !clientAction,
    clientAction
      ? "action=javascript:throw — dispatch was wrapped again; the submit will never reach the server"
      : openTag.slice(0, 100),
  );
}

const actionFields = [
  ...frag.matchAll(
    /<input type="hidden" name="(\$ACTION[^"]*)"(?: value="([^"]*)")?\s*\/>/g,
  ),
].map(([, name, value]) => [name, decode(value ?? "")]);

check(
  "form carries its action encoding",
  actionFields.length > 0,
  actionFields.map(([n]) => n).join(", ") || "none found",
);

const build = (fields) => {
  const fd = new FormData();
  for (const [n, v] of actionFields) fd.set(n, v);
  fd.set("id", work.id);
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

// 3. A valid edit must actually reach Postgres.
const NEW_TITLE = `${MARK} edited`;
{
  const res = await fetch(pageUrl, {
    method: "POST",
    headers: { cookie },
    body: build({
      title: NEW_TITLE,
      subtitle: "",
      external_url: "https://example.com",
      image_url: "",
    }),
    redirect: "manual",
  });
  const row = await (
    await admin(`/rest/v1/works?select=title&id=eq.${work.id}`)
  ).json();
  check(
    "valid edit reaches Postgres",
    row[0]?.title === NEW_TITLE,
    `HTTP ${res.status}, stored ${JSON.stringify(row[0]?.title)}`,
  );
}

// 4. Invalid input must be rejected and must not write.
{
  const res = await fetch(pageUrl, {
    method: "POST",
    headers: { cookie },
    body: build({ title: "", external_url: "not-a-url", image_url: "" }),
    redirect: "manual",
  });
  const body = await res.text();
  const row = await (
    await admin(`/rest/v1/works?select=title&id=eq.${work.id}`)
  ).json();
  const surfaced = /required|Enter a full URL/i.test(body);
  check(
    "invalid input is rejected and the row is untouched",
    surfaced && row[0]?.title === NEW_TITLE,
    `errors surfaced: ${surfaced}, title still ${JSON.stringify(row[0]?.title)}`,
  );
}

// --- cleanup ------------------------------------------------------
console.log("\n--- cleanup ---");
await admin(`/rest/v1/works?id=eq.${work.id}`, { method: "DELETE" });
await admin(`/auth/v1/admin/users/${userId}`, { method: "DELETE" });
console.log(`removed test row and user ${EMAIL}`);

const failed = results.filter((r) => !r.passed);
console.log(`\n${results.length - failed.length}/${results.length} assertions passed`);
if (failed.length) process.exit(1);
