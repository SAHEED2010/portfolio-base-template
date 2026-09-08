# CHANGES.md

Dated log of changes to the **base**, written for one purpose: so that
when you're inside a fork, you can see what's happened since it was
forked and decide what's worth porting by hand.

Forks do not auto-receive these — that's accepted (`DECISIONS.md`,
Product shape). Porting guidance is in `FORKING.md`.

Newest first. Each entry says what changed and **whether a fork needs
to care**.

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

- `/studio` admin does not exist yet
- `src/app/favicon.ico` is still the stock Next.js icon — replace per
  `FORKING.md` §7
- No Open Graph image ships with the base
- No CI yet
