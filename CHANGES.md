# CHANGES.md

Dated log of changes to the **base**, written for one purpose: so that
when you're inside a fork, you can see what's happened since it was
forked and decide what's worth porting by hand.

Forks do not auto-receive these — that's accepted (`DECISIONS.md`,
Product shape). Porting guidance is in `FORKING.md`.

Newest first. Each entry says what changed and **whether a fork needs
to care**.

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
