# DECISIONS.md

Settled decisions, grouped by topic. Each entry has a date and a
one-line reason. Do not reopen without cause. Append new entries under
the right section — create a new section if none fits.

CLAUDE.md has the short-form summary of what's settled. This file has
the reasoning.

---

## Stack

- **2026-09-07 — Next.js App Router + TypeScript + Tailwind + Supabase
  + Vercel + Resend**: single Supabase account per client covers DB,
  storage and auth; server actions remove the need for a separate API
  layer.
- **2026-09-07 — Not Turso, not Mongo Atlas**: databases only. Would
  require a separate storage account and separate auth, tripling the
  per-client setup.
- **2026-09-07 — Not Laravel**: reference (rezaghz.com) is Laravel/
  Blade, but one-repo-per-client + Vercel deploy is lighter than
  matching that stack for our scope.
- **2026-09-07 — pnpm, `src/` layout, `@/*` alias, ESLint + Prettier**:
  scaffolding choices at Phase 1 step 1. Pnpm is disk-efficient and
  Vercel-native; `src/` separates app code from config as theme/client
  files accumulate at root.
- **2026-09-08 — `.npmrc` with `node-linker=hoisted`**: pnpm's default
  symlink-based `node_modules` fails with EPERM on Windows without
  Developer Mode enabled. Hoisted linking is functional but less
  disk-efficient; removable once Developer Mode is on.

## Product shape

- **2026-09-07 — Neutral base template, forked once per client**: two
  clients picked the same reference. Fork keeps the base neutral and
  lets each fork tailor to its client's profession without touching
  the other.
- **2026-09-07 — Base-to-fork drift accepted**: a bug fixed in the
  base does not auto-propagate. Mitigation: CHANGES.md logs base
  changes; port by hand when a fork is touched for other reasons.
- **2026-09-08 — `seed.sql` reads as a coherent creative-professional
  persona, not "Sample 1 / Sample 2"**: the base should look like a
  real portfolio on first load so its design can actually be judged.
  Narrows the "nothing profession-specific in the base" rule to CODE
  and COPY IN COMPONENTS — seed rows are replaceable content that
  every fork overwrites, and a placeholder name/persona there is
  intentional, not a leak.

## Schema

- **2026-09-07 — Rigid tables, not schema-driven**: it's a portfolio,
  shape is known. Accepted cost: new profession = code change, not
  config edit.
- **2026-09-07 — Projects and Portfolio merged into `works`**:
  reference had two near-identical grids; the distinction was Reza's,
  not general.
- **2026-09-07 — Section labels stored in `site_settings`**: cheap
  80% of what schema-driven would give — client sees "Cases" or
  "Publications" without a migration.
- **2026-09-07 — Headings editable, not hardcoded**: "edit almost all
  the information" was the client requirement. The reference did NOT
  do this — every heading is in Blade. Our base fixes that.

## Design tokens

- **2026-09-08 — `theme.ts` holds TWO font tokens (`displayFont` +
  `bodyFont`), amending the original "one font family"**: a real
  display/body contrast is most of what separates a designed page from
  a template. The "one file to restyle a fork" principle is unchanged —
  the file just holds two font tokens instead of one.
- **2026-09-08 — Font pairing: Fraunces (display) + Inter (body)**,
  loaded via `next/font/google` with `display: swap`. Fraunces is
  variable (optical-size and "wonk" axes), so a fork can shift
  character by editing `theme.ts` alone rather than swapping fonts.
- **2026-09-08 — Palette "Slate & Teal" with a warm neutral ramp**.
  Fixed values, not to be re-argued:
  - `primary` `#14181C` (deep slate ink)
  - `accent` `#2E6E68` (muted teal); hover `#245853`, light `#3E8A83`
  - neutrals, warm-tinted rather than pure gray (pure `#888` grays are
    the tell of a template):
    `50 #FAF9F7`, `100 #F4F2EF`, `200 #E8E4DF`, `300 #D6D1CA`,
    `400 #A9A29A`, `500 #7D766D`, `600 #5C5650`, `700 #423E39`,
    `800 #2B2825`, `900 #1A1917`
  - Deliberately not yellow and not SaaS-indigo, to avoid both the
    reference's signature and the default-template look.
- **2026-09-08 — Animation is CSS + a small IntersectionObserver
  reveal hook; no Framer Motion**: hero entrance, scroll reveals and
  hover states are all trivially CSS, and the testimonial carousel can
  use native scroll-snap. Framer Motion would force `"use client"`
  boundaries around sections that should stay server components for
  Supabase reads. Revisit per-component only if a specific animation
  needs orchestration CSS can't express.
- **2026-09-08 — Hero tagline is a fade/slide crossfade, ~300ms cap,
  reserved line-height, honors `prefers-reduced-motion`**: not the
  reference's typewriter, which reads dated and shifts layout as the
  line grows.
- **2026-09-08 — Sticky header gets one on-scroll transition
  (transparent → solid, slight shrink)**: defensible because it
  reclaims vertical real estate on mobile, not because it's decorative.

## V1 scope

- **2026-09-07 — Cut from V1**: booking, payments, i18n, blog, promo
  modal, project/portfolio detail pages, self-serve password reset.
  Each is in the reference, none are required by the two clients.
- **2026-09-07 — Each work card links to an external URL**: no detail
  pages in V1. Add in V2 only if a client's work actually needs it.
- **2026-09-07 — Password reset is manual via Supabase dashboard**:
  removes an email-service dependency for V1.
- **2026-09-09 — Contact does BOTH: direct-message buttons (primary)
  and the contact form (fallback)**. Updates the earlier thinking
  that the form was the only contact path. Visitors arrive from
  WhatsApp and Instagram on phones, where tapping through to a
  messaging app converts far better than filling a form — but
  removing the form entirely would mean enquiries live only in the
  client's personal WhatsApp: no record on the site, unsearchable,
  lost on a phone change, and recruiters often prefer a formal
  written enquiry anyway. `contact_messages` and the studio inbox
  therefore stay, fed by the form path.
- **2026-09-09 — Contact section is stacked, not the details/form
  split**: a side-by-side layout gives the message buttons and the
  form equal visual weight, which contradicts the intended priority.
  Vertical order states it plainly — message first, write second. The
  split only ever did work on desktop; at 375px it collapsed to this
  same stack.
- **2026-09-10 — Cut from V1: email notifications on new contact
  messages (Resend)**: committed in the original stack plan, never
  built. Found at the ultra-review (pre-push) that nobody had formally
  closed the loop on it the way booking/payments/i18n/blog were.
  Deferred to V1.1 because Resend requires per-fork domain
  verification that `FORKING.md` doesn't currently document — adding
  the dependency without that documentation would leave every fork
  operator to work out sender-domain setup alone. Clients check
  `/studio/inbox` for new messages in V1.

## Auth

- **2026-09-07 — Two users per site (client + support)**: I need
  access without a shared password.
- **2026-09-07 — Admin at `/studio`, not `/admin` or `/panel`**: path
  obscurity is a small extra, not the security layer. Real Supabase
  Auth behind it.

## Images and storage

- **2026-09-07 — Browser-side compression, 2MB hard cap, Supabase
  Storage**: Vercel has no persistent disk, so local file writes
  aren't an option. Client-side compression avoids server CPU and
  queues.
- **2026-09-08 — One bucket named `media`, not per-purpose buckets**:
  generic name covers portraits, work images and avatars; the path
  encodes which. One bucket keeps the policy surface small.
- **2026-09-08 — Bucket defined in a SQL migration, not
  `config.toml`**: config.toml buckets are local-dev only. The base is
  forked to real Supabase projects, so the bucket must be reproducible
  in production.
- **2026-09-08 — Bucket-level `file_size_limit` of 2 MiB**: defence in
  depth. The browser-side compression cap rejects oversize files with
  a friendly error; the bucket rejects them even if that layer is
  bypassed.
- **2026-09-09 — Storage object lifecycle**: path is
  `<folder>/<uuid>.<ext>` (random name — no collisions, no leaked
  client filenames, no unicode/space handling). The row stores the
  full public URL, so cleanup derives the object path back out of it;
  a URL that isn't ours parses to null and is never deleted.
  - **Replacing an image deletes the old object.**
  - **Deleting a row deletes its object.**
  - Both are **best effort** — a failed cleanup logs a warning and
    never blocks the user's save. A leaked object is annoying; a save
    that fails because cleanup failed is worse.
  - **Accepted V1 gap:** uploading an image and then abandoning the
    form without saving orphans that object. Closing it would mean
    deferring upload until submit (losing instant preview) or a
    scheduled sweep. Neither is worth it at ~15 images per site; if a
    fork ever needs it, the sweep is "list bucket, delete anything no
    row references".
- **2026-09-09 — Reordering rewrites the whole list, not a two-row
  swap**: swapping only works when `display_order` is already a clean
  sequence. Once duplicates or gaps exist — a failed write, a manual
  DB edit, rows sharing the default 0 — a swap either does nothing
  visible or moves the wrong row. Rewriting 1..n on every move is
  self-healing, and these lists hold single digits of rows.
- **2026-09-09 — Smoke tests clean up after themselves**: FORKING.md
  has you run them against the CLIENT'S live project, so leaving
  rows behind would put "smoke-…" cards on a real portfolio. Found
  after 4 runs had accumulated junk in every content table.
- **2026-09-09 — Dark mode, three-state (system / explicit light /
  explicit dark), on both the public site and the studio**: colours
  stay non-editable (`DECISIONS.md` unchanged elsewhere) — this is a
  second CSS token set switched by `data-theme`, never exposed to
  `site_settings` or the field map. One `localStorage` key ("theme")
  covers both surfaces: confirmed, not assumed, that the whole app
  renders exactly one `<html>` (studio's own layout returns a bare
  fragment), so there is one origin and one store regardless of which
  page a visitor hits first, in dev or prod.
  - No attribute set = system, tracked live by a plain
    `@media (prefers-color-scheme: dark)` query with zero JS. An
    explicit choice sets `data-theme` on `<html>`, which always wins
    over the OS.
  - The homepage stays `○ Static` — verified in the build output, not
    assumed. Theme resolution is entirely client-side (inline script
    reads `localStorage` before paint); nothing touches a cookie or
    header at request time.
  - Dark values are picked and contrast-checked on their own
    (`--color-page #17181A`, `--color-ink #EDEAE4` 14.8:1,
    `--color-muted #9A9488` 5.9:1, `--color-surface #1E2023`,
    `--color-accent-text #4F9992` 5.3:1 — plain `--color-accent`
    fails at 3.0:1 for text-sized use, same problem already solved
    once for the testimonials band), not inverted from the light
    palette.
  - `--color-border` was raised from an initial `#34373B` (1.5:1) to
    `#6B6E72` (3.19–3.47:1) after checking, not assuming, that every
    studio surface (list rows, Overview tiles, form inputs) has ZERO
    shadow and relies on the border alone to separate a white-ish
    card from an off-white-ish page — a genuinely structural boundary
    (WCAG 1.4.11), not a decorative divider.
  - `--color-anchor` + 3 fixed companions (`-fg`, `-muted`, `-accent`)
    decouple the testimonials dark band from the swappable palette —
    values unchanged from what was already hardcoded, so the "one
    break in an otherwise uniform page" (§1.9) survives the rest of
    the page going dark.
  - The inline script's no-flash guarantee was verified against the
    real rendered HTML, not assumed: it does NOT end up textually
    first in `<head>` (Next.js's own generated tags come first
    regardless of JSX order) — it stays flash-free because a
    `<link rel="stylesheet">` only starts an async fetch without
    blocking the parser, so the synchronous script still runs and
    sets `data-theme` well before the browser's paint, which actually
    waits on the stylesheet finishing.
- **2026-09-08 — MIME allow-list: jpeg, png, webp only**: `image/svg+xml`
  excluded because SVG is an XSS vector on user upload; `image/gif`
  excluded as large, animated, and rarely wanted on a portfolio.
- **2026-09-12 — Hero secondary CTA ported to `text-muted`, not
  `text-neutral-700`**: found on the Afeez Adisa fork (2026-09-11) via
  a chrome-devtools screenshot pass — the fixed neutral measured
  1.67:1 against the dark-mode page background, failing WCAG AA's
  4.5:1. Ported back to the base (`CHANGES.md`) rather than left as a
  per-fork fix, so every future fork inherits it. Tagged `v1.0.1`.

## Accounts and ownership

- **2026-09-07 — Client owns the Supabase project and domain, invites
  me as collaborator; Vercel account is mine**: shared passwords are
  a liability; invites are revocable. Vercel under me because I'm the
  one deploying.
- **2026-09-07 — Free tier accepted, with known cost**: Supabase free
  tier pauses after inactivity. Mitigation: a Vercel cron pings the DB
  to keep it warm.
- **2026-09-09 — Shipped, not aspirational**: `/api/cron/keep-warm` +
  `vercel.json`, once daily. Found at the freeze that the mitigation
  above had been committed to but never built — `FORKING.md` told
  forks to "add" a cron with nothing to point at. Daily isn't a
  conservative choice, it's Vercel Hobby's actual ceiling for cron
  frequency (confirmed against Vercel's docs before building — free
  tier is capped at once per day, ±59 min timing precision), leaving
  a ~6-day margin against Supabase's ~7-day pause window. Guarded by
  `CRON_SECRET` (Vercel's documented pattern — set manually per
  project, not auto-generated). Building once in the base means every
  fork inherits it instead of debugging the instruction.
- **2026-09-10 — Cron route uses the anon key, not service role**:
  the first version used service role, reasoning that a cron trigger
  has no user session to authorize against. Found at the ultra-review
  (pre-push) that this contradicts `FORKING.md`'s explicit "never add
  the service role key to Vercel" — a fork following that instruction
  literally would have shipped a cron that 500s on every real
  invocation, only appearing to work in local dev where a developer's
  own `.env.local` happened to hold that key for other reasons.
  Unnecessary anyway: `site_settings` has public SELECT RLS, so the
  anon key reads it exactly as well. Re-verified locally after the
  fix: 200 with the anon key doing the read, 401 on a wrong or
  missing `CRON_SECRET`, same as before.
- **2026-09-09 — Base ships the stock Next.js favicon on purpose, not
  a neutral custom one**: `check-seed-drift.mjs` can only flag
  *content* (a row, a `site_settings` value) — it has no way to check
  a binary file, so nothing automated ever catches a forgotten
  favicon or OG image. A neutral placeholder would just be a
  different thing to forget; the obviously-wrong stock icon is the
  more honest failure mode; if it's still there in a client's browser
  tab, that's an unmistakable signal. `FORKING.md` §10.

## CI and code review

- **2026-09-07 — CI planned for Phase 1** *(superseded below — this
  entry named `pnpm test`, which the actual build never added)*.
- **2026-09-09 — CI is typecheck + lint + build only, no test suite**:
  the four smoke-test suites need a live Supabase project with real
  seed data — credentials in CI secrets or a spun-up instance per run,
  neither worth it for a template repo with no live project of its
  own. They stay local scripts, run by hand against a fork before it
  goes live (`FORKING.md` §3). CI's actual job: a fork edited months
  from now, by someone who isn't either of us, still gets told when it
  stops compiling. Needs zero Supabase credentials even for the build
  step — verified by running `pnpm build` with both env vars empty
  before writing the workflow: `src/lib/db.ts` degrades to a
  `console.warn` and empty results rather than throwing.
- **2026-09-07 — No AI review bot in V1**: Claude Code's build-test-
  review loop already runs tests and type-check before handing over
  code. Adding CodeRabbit or similar on a solo repo produces mostly
  style-nit noise that trains me to ignore signals. Revisit at Phase
  2 when there's a base-vs-fork drift question worth automated review.

## Schema details

- **2026-09-08 — UUID primary keys (`gen_random_uuid()`)**: Supabase
  convention; avoids exposing sequential row counts (e.g. total
  testimonials) the way a serial/bigint id would.
- **2026-09-08 — `created_at` + `updated_at` timestamptz on every
  table, `updated_at` maintained by a trigger**: cheap and uniform;
  useful for support/debugging even on tables that rarely change.
- **2026-09-08 — `display_order` column name, not `order`**: `order`
  is a reserved SQL keyword; avoids quoting it everywhere.
- **2026-09-08 — Image/logo/avatar fields store the full public
  Supabase Storage URL as text**: simplest to render directly in
  markup with no URL-building step. Accepted coupling to Supabase
  Storage specifically — noted in SCHEMA.md.
- **2026-09-08 — `stats.number` is free text, not integer**: stat
  blocks mix formats ("50+", "10 yrs", "$2M") that aren't computed
  on, so forcing a numeric type blocks legitimate content for no
  benefit.
- **2026-09-08 — `experiences.start_date`/`end_date` as structured
  `date` columns, `end_date` nullable = "Present"**: enables
  chronological sorting; free text can't be trusted to sort right
  across entries.
- **2026-09-08 — `experiences.type` is free text, unconstrained, for
  V1**: no fixed set of values is known yet. Real client data across
  forks will tell us if a fixed set (e.g. work/education) emerges —
  until then a CHECK constraint or enum would just be a guess.
- **2026-09-08 — `testimonials.rating` nullable integer with CHECK
  1–5**: some pull quotes carry no star rating; the CHECK still keeps
  bad data out when a rating is present.
- **2026-09-08 — `contact_messages` columns: name, email, message,
  `read` boolean default false, created_at, ip_address (hashed, not
  raw)**: enough for a working inbox. IP is hashed rather than stored
  raw so it's still useful for basic spam-pattern matching (repeat
  submissions) without holding raw PII long-term. Phone/subject are a
  cheap follow-up migration if a client needs them.
- **2026-09-08 — `site_settings` is `(key text primary key, value
  jsonb)`**: one column type handles every case uniformly — JSON
  string for a heading, JSON array for hero rotating phrases, JSON
  object if a setting ever needs structure — with no schema change
  when the shape of a setting's value changes.
- **2026-09-08 — Added `display_order` to `stats`**: it was the only
  list table without one, leaving row order non-deterministic.
  Consistency with the other list tables, and clients will want to
  reorder the stat block from the studio.
- **2026-09-09 — `site_settings.contact_channels` shape**: a jsonb
  array of `{label, url, primary?}`, deliberately mirroring
  `social_links` so there's one array-of-links shape to learn rather
  than two. `primary: true` marks the single filled button; the first
  flagged entry wins, and if a fork flags none (or several) the first
  entry is used — a malformed array still renders a primary action
  instead of none. No migration: `site_settings` is key/value jsonb,
  which is exactly the case it was chosen for.
- **2026-09-09 — Testimonials are a continuous marquee, not a
  scroll-snap carousel**, with an explicit pause/play control.
  Auto-moving content needs a stop mechanism (WCAG 2.2.2); hover and
  focus pausing cover mouse and keyboard but **not touch**, so a
  visible button is required rather than optional. Falls back to a
  plain scroller under `prefers-reduced-motion`.
- **2026-09-09 — `site_settings.value` is nullable, not `NOT NULL`**:
  a JSON `null` in a PostgREST update body always maps to SQL `NULL`
  for that column — there is no way to send "store the JSON null
  literal" separately from "clear this column" over that wire format.
  With the column `NOT NULL`, every attempt to clear an optional
  setting silently failed the constraint. Matches the settled
  semantics directly ("optional keys are nullable") rather than
  fighting them; `settingString`/`settingArray` already treat `null`
  as absent, so no component changed.
- **2026-09-09 — `site_settings` field map is canonical, not
  per-fork**: how a key is edited (text / textarea / list / image) is
  a property of the schema, not of the client — two forks editing
  `hero_phrases` get the identical control. A fork extends the map
  when it adds a setting; it never rewrites an existing entry. A key
  present in the database but absent from the map still renders — as
  a plain text field with a console warning — rather than vanishing.
- **2026-09-09 — Structural vs optional keys**: `site_title`,
  `hero_name`, and the six `label_*` keys block a blank save with a
  clear message — they hold up the page's own scaffolding (H1, nav,
  browser tab), not content a section can simply omit. Every other
  key is optional: nullable, and the public site skips rendering it
  rather than emitting an empty element.
- **2026-09-09 — No render-time fallback copy**: a blank field reads
  as blank on the public site, never silently replaced by template
  text (e.g. `settingString(settings, "site_title", "Portfolio")`
  would let a fork ship to a client still showing "Portfolio"
  somewhere nobody noticed). Two such fallbacks were removed from
  `layout.tsx`/`page.tsx` when this was written.
- **2026-09-09 — Seed content is realistic, not placeholder-shaped,
  with a drift check as the safety net**: "Mara Ellison" and a
  project called "Meridian" make the base look like a finished site
  rather than an empty shell — but realism is exactly what lets
  seeded content survive to launch unnoticed, unlike an obvious
  "Sample Project 1". `scripts/generate-seed-manifest.mjs` derives
  `scripts/seed-manifest.json` from `seed.sql` (generated, not
  hand-duplicated, so the two can't drift apart);
  `scripts/check-seed-drift.mjs` compares live content against it and
  flags anything unchanged. Required, not optional, before a fork
  launches — `FORKING.md` §10.
- **2026-09-08 — RLS smoke tests use plain `fetch` against PostgREST,
  not `@supabase/supabase-js`**: no extra dependency, and it exercises
  the same HTTP path the app uses, so RLS is observed directly rather
  than mediated by a client library.