# CHANGES.md

Dated log of changes to the **base**, written for one purpose: so that
when you're inside a fork, you can see what's happened since it was
forked and decide what's worth porting by hand.

Forks do not auto-receive these — that's accepted (`DECISIONS.md`,
Product shape). Porting guidance is in `FORKING.md`.

Newest first. Each entry says what changed and **whether a fork needs
to care**.

---

## 2026-09-12 — Fix: hero secondary CTA unreadable in dark mode

### Fixed

- `src/components/hero.tsx` — the secondary hero CTA ("See what I've
  built") hardcoded `text-neutral-700`, a fixed light-mode neutral
  (`FRONTEND_SPEC.md` §1.1's "always-fixed layer"), instead of the
  theme-reactive `text-muted` token every other dark-mode-aware
  element uses. Measured contrast against the dark-mode page
  background: 1.67:1 — WCAG AA requires 4.5:1. Swapped to `text-muted`
  (5.89:1 dark, ~4.26:1 light).

**Fork needs to care: yes, if forked before this commit and dark mode
is in use.** Found via a chrome-devtools screenshot pass on the Afeez
Adisa fork (2026-09-11) and logged there for port-back; applied here
so new forks inherit the fix instead of re-discovering it. Tagged
`v1.0.1`.

---

## 2026-09-09 — Studio: Inbox (loop 4 — the studio is now feature-complete)

### Added

- `/studio/inbox` — list, mark read/unread, delete, `mailto:` reply.
  No create or edit route: messages arrive only through the public
  contact form (anon INSERT, already proven by `rls-smoke-test.mjs`);
  the studio's only jobs on this table are read state and deletion.
  Sorted newest-first by `created_at` — this table has no
  `display_order` and shouldn't get one, it's inbound mail, not a
  curated list.
- `formatDateTime` in `lib/format.ts`, formatted in the viewer's own
  time zone — `created_at` is a real timestamptz, unlike the
  date-only columns the existing UTC-pinned helpers exist for.

### Verified, not assumed

- Re-ran `rls-smoke-test.mjs` before starting this loop specifically
  to confirm the anon-DELETE-removes-nothing assertion still held
  after a Docker/Supabase restart mid-session — 10/10.
- End-to-end check seeds a row through the REAL anon INSERT path (not
  a service-role shortcut), then drives mark-read, mark-unread, and
  delete through the actual rendered form's action encoding — 13/13.
  Building that check reproduced the `Prefer: return=representation`
  401 gotcha (documented in `contact-form`'s server action) in the
  test script itself before it was fixed there — the same mistake is
  easy to make twice.
- The unread-row styling (`border-accent/25 bg-accent/5`) is the
  identical class string already used by Overview's unread-count
  callout, which had already gone through the accepted dark/light
  browser pass — confirmed via string match rather than re-deriving
  the contrast case.

This closes loop 4. The studio now covers all seven content tables
plus the inbox: auth, works, experiences, skills, testimonials,
stats, site_settings, and now contact_messages.

---

## 2026-09-09 — Studio: Site content, and the seed-drift check

### Added

- `/studio/settings` — the `site_settings` field map
  (`src/lib/studio/settings-fields.ts`) drives curated, grouped forms
  (Identity & SEO, Hero, Section labels, About, …) instead of a raw
  key/value editor. A key in the database but not in the map still
  renders — as a plain text field with a console warning — rather
  than vanishing.
- `scripts/generate-seed-manifest.mjs` / `scripts/seed-manifest.json`
  / `scripts/check-seed-drift.mjs` — the realistic seed content
  ("Mara Ellison", "Meridian") is deliberately hard to eyeball as
  fake, so this compares live content against the seeded values and
  flags anything unchanged. **Required step before a fork launches**
  — `FORKING.md` §10.
- `studio-smoke-test.mjs` now covers all five list tables: 16/16.

### Schema

- `20260909000000_site_settings_value_nullable.sql` — `value` was
  `NOT NULL`. A JSON `null` in a PostgREST update body always maps to
  SQL `NULL`, so there was no way to clear an optional setting without
  hitting the constraint — every such save silently failed.
  **Forks: run `supabase db push`.**

### Bugs fixed

- Two render-time fallback strings removed (`site_title` defaulting
  to `"Portfolio"`) — a fallback like that is template copy that could
  ship to a client's live site unnoticed.
- The manifest generator's own SQL parser under-counted by 5 keys on
  first run: a whole-line comment containing a literal semicolon
  ("…for its own; nothing here is hardcoded.") terminated the
  regex-based block match early. Comments are now stripped before
  parsing.
- `check-seed-drift.mjs`'s first version used `JSON.stringify`
  equality, which Postgres jsonb defeats silently: object key order is
  normalized on the way back out of the database, so a semantically
  identical `contact_channels`/`social_links` value never matched the
  manifest — a false negative in exactly the direction that matters
  (content that should have been flagged, wasn't). Replaced with an
  order-independent deep-equal; verified against the live DB both ways
  (still-seeded flagged, edited-then-restored flagged again).

**Forks: re-run all four checks (10/10, 5/5, 16/16, then
`check-seed-drift.mjs` clean) before launch.**

---

## 2026-09-09 — Studio: auth, shell, and works CRUD

Commits `7387b65`, `99c571a`, `0e18029`, `51c1206`, `393366d`.

### Added

- `/studio` behind Supabase Auth (`@supabase/ssr`), anon key only —
  no service-role key anywhere in the app
- Middleware refreshes the session and gate-keeps `/studio/*`, scoped
  so the public site stays statically prerendered
- Works CRUD end to end, plus the three pieces the remaining screens
  reuse: `image-upload.tsx`, `use-unsaved-changes.ts`,
  `reorder-controls.tsx` + `lib/reorder.ts`
- `scripts/studio-smoke-test.mjs` — 5 assertions, self-cleaning

### Security — forks MUST act on this

- **`enable_signup` was `true`.** Write policies grant to the
  `authenticated` role, so anyone could self-register into write
  access on all six content tables. Now `false` under `[auth]`.
- **Leave `[auth.email] enable_signup = true`** — despite the name it
  maps to `EXTERNAL_EMAIL_ENABLED` and disables email *login*, locking
  every user out.
- The hosted project has its own signup setting **and** its own OAuth
  providers, neither governed by `config.toml`. `FORKING.md` §5.

### Bugs fixed (worth knowing if you fork an earlier commit)

- **Edit forms never reached the server.** Wrapping
  `useActionState`'s dispatch in an arrow function turns the form into
  a client action; React renders
  `action="javascript:throw …"` and the submit is silently dropped.
  Pass `formAction` directly. Guarded by the studio smoke test.
- **Signed-in users were bounced to the login page.** Middleware
  returned bare redirects, discarding the rotated auth cookies, so the
  browser kept a token the server had already invalidated.
- **The login page rendered inside the signed-in chrome.** Fixed with
  an `(app)` route group; URLs unchanged.
- **Both smoke tests used to leave their rows behind** — which mattered
  because `FORKING.md` runs them against the client's live project.
  All three now clean up.

**Forks: re-run all three smoke tests (10/10, 5/5, 5/5).**

---

## 2026-09-09 — Phase 1 foundations

Commit `0401659` — first commit. Everything below is the initial base;
forks created from this commit need port nothing.

### Schema (`supabase/migrations/`)

- `20260908000000_init_schema.sql` — the seven tables, `pgcrypto`, a
  shared `set_updated_at()` trigger, and RLS on every table
- `20260908010000_storage_media_bucket.sql` — `media` bucket: public
  read, authenticated write, 2 MiB cap, jpeg/png/webp only
- `20260908020000_stats_display_order.sql` — added `display_order` to
  `stats`, which was the only list table without one

**Forks: run `supabase db push`. All three are required.**

### Public site

Single scrolling page: hero, about, skills, experiences, works,
testimonials, contact, footer. Every displayed string reads from
`site_settings`. Server components for all reads; client islands only
for the rotating tagline, scroll reveals, header, marquee and contact
form.

- Fraunces + Inter, "Slate & Teal" palette, tokens in `src/theme.ts`
- Mobile-first: 44px touch targets, nothing hover-only
- CSS motion system, fully disabled under `prefers-reduced-motion`
- Testimonials are a continuous marquee on the one dark band, with a
  pause control (WCAG 2.2.2 — hover/focus pausing doesn't exist on
  touch)
- Contact offers direct-message channels (primary) plus a form
  fallback writing to `contact_messages` via a server action

### Tests

- `scripts/rls-smoke-test.mjs` — 9 assertions, proves RLS behaves
- `scripts/storage-smoke-test.mjs` — 5 assertions, proves the bucket's
  size and MIME limits actually reject

**Forks: run both after `db push`. Expect 9/9 and 5/5.**

### Known gaps at this commit

- `/studio` admin did not exist yet at this commit (added later the same day — see the entry above)
- `src/app/favicon.ico` is still the stock Next.js icon — replace per
  `FORKING.md` §7
- No Open Graph image ships with the base
- No CI yet
