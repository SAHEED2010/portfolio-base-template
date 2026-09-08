# CLAUDE.md

## Mission

This repo is the **base template** for a portfolio-site service. The base
is forked once per client and tailored to that client's profession. You
work on the BASE ONLY unless I say otherwise. Nothing profession-specific
lives in the base — no client names, no professions, no copy. Ever.

Sibling files: **DECISIONS.md** (settled decisions, grouped), **SCHEMA.md**
(tables, columns, RLS), **FORKING.md** (base → client fork), **CONTEXT.md**
(shared vocabulary), **CHANGES.md** (dated log of base changes),
**README.md** (setup).

---

## How you work

### 1. Grill before you build

For any decision not already settled here or in DECISIONS.md, GRILL me
before writing code.

Grilling means: map the decision as a design tree, work it in rounds.
Each round, ask the whole current frontier — every question whose
prerequisites are already settled — numbered, each with your
recommended answer, in this format:

    ❓ **Q1** — **<title>**: <question, options laid out plainly>
    ➡️ <your recommended answer, with a one-line reason>

Then stop and wait. A question that depends on another still-open
question in the same round belongs to a LATER round.

Facts are your job, decisions are mine. If a question needs a fact from
the filesystem, from Supabase, from a doc — go find it yourself. Put
decisions to me and wait.

The session ends when the frontier is empty and I confirm shared
understanding. Do not act on a plan I haven't confirmed.

When a decision is settled, append it to the right section of
DECISIONS.md with the date and one line of reasoning.

### 2. What does NOT need grilling

- Syntax, imports, obvious refactors, following patterns already in
  the codebase, fixing a bug with a clear cause. Just do these.
- Anything already answered in this file, DECISIONS.md, SCHEMA.md, or
  FORKING.md. Point me at the file if I ask something already answered.

### 3. Teach as you build

I'm learning as we go. Explain code inline as you introduce things:

- When you use a syntax, pattern, or library feature I might not know
  (server actions, RLS policies, Suspense boundaries, Zod schemas,
  cookies), say what it is and why it fits here in one or two sentences.
- When you make a design choice with a real alternative (server vs
  client component, `useEffect` vs server-side fetch, form action vs
  API route), name the alternative and why you didn't pick it. One line.
- When you use a Next- or Supabase-specific idiom, name it as such so
  I can search for it later.
- Assume I know: JavaScript, HTML, CSS, git. Assume I don't know: Next
  App Router specifics, server actions, RSC boundaries, Postgres RLS,
  Supabase client patterns, Tailwind's less obvious utilities.
- Don't over-explain the obvious. The test: would I recognize this
  pattern in a different codebase a month from now? If not, explain it.
- If I ask "what does this do" or "why this way", give the full answer.

Teaching replaces the comments you'd have written anyway.

### 4. Loop autonomously when there's a hard signal for "done"

For any task with an objective pass/fail signal, close the loop
yourself. Don't hand me half-working code:

1. **Write** the smallest slice that could work
2. **Run** it — tests, type-check, lint, actual execution. Actually
   run it. Don't guess at output.
3. **Read** the real result. If it failed, diagnose from the real
   output, not from what you expected.
4. **Fix** one change at a time so you know which change did what.
5. **Re-run.** Repeat until green.
6. **Then** show me.

Signals that qualify as "hard":
- Tests pass (Vitest for units, Playwright for flows if added)
- TypeScript compiles with no errors
- ESLint passes
- Dev server starts, route returns 200
- Supabase migration applies without error
- Form submission writes the expected row
- Image upload lands in Storage and returns a URL

Stop the loop ONLY if:
- Three genuinely different approaches all failed — then grill me,
  the assumption is probably wrong
- The fix would require reopening a decision in DECISIONS.md
- You need a credential, key, or account I haven't provided

For tasks WITHOUT a hard signal — visual design, copy, "does this feel
right" — do NOT loop. Build one version, show me, wait. Looping on
subjective work just polishes without getting closer to right.

Write tests as you go for anything with real logic: server actions,
validators, the image-compression helper, RLS policies. Not for
presentational components. The test IS the signal that closes the loop.

### 5. Report the loop when it ends

Short, bullet form:
- What you built
- What signals you closed against (tests written, checks run)
- Which iterations failed and what you learned
- Any mid-loop decision that isn't in DECISIONS.md

### 6. Habits

- Small commits, conventional commit messages
- Do not add features I didn't ask for
- Do not add tables beyond the seven — grill first
- Do not hardcode strings that belong in `site_settings`. If a heading
  or intro appears on the public page, it comes from the DB.
- Before writing schema migrations, show them for review — highest-
  leverage thing to get right
- When you finish a build step, stop and show me before moving on

---

## Model routing (my responsibility, not yours)

I choose which Claude model runs each session — not you. But so we
share the shape of how I think about it:

- **Sonnet** is the default. Loops, builds, migrations, tests,
  applying reviewed plans. Fast, cheap, strong at instruction-
  following, handles this file well. Most work.
- **Opus** for hard decision points: schema design, RLS policy
  design, debugging after three failed loop attempts, architectural
  choices, planning fork tailoring. Expensive, worth it only when
  getting it wrong is expensive.
- **Haiku** for mechanical grunt work: renames, prop additions,
  small refactors. Cheap and fast for shape-preserving edits.

If a session feels like it's struggling on a decision, I may `/model`
mid-session and continue. Behavior toward `CLAUDE.md`, `DECISIONS.md`,
and the working discipline stays identical across models — nothing in
those rules is model-specific.

---

## What's settled

Full history and reasoning in **DECISIONS.md**. Summary here so you
have the shape without leaving this file.

### Stack

- Next.js (latest stable), App Router, TypeScript
- Tailwind CSS
- Supabase — Postgres + Storage + Auth (free tier)
- Deployed on Vercel
- Server actions for all writes; no separate API layer
- `browser-image-compression` for client-side image compression
- Resend for transactional email
- pnpm as package manager
- `src/` directory layout, `@/*` import alias, ESLint + Prettier

### Product shape

- One neutral base template in this repo
- Clients get a FORK, one repo per client
- Base is boring on purpose. Anything only one client needs → their
  fork. Anything both need → base.

### Schema (seven tables, rigid)

Full spec in SCHEMA.md. In short:

1. `site_settings` — key/value; ALL editable copy including section
   headings, intros, hero rotating phrases, and section labels (what
   each section is CALLED for this client)
2. `skills` — name, order
3. `experiences` — title, org, logo, dates, type, description, order
4. `works` — title, subtitle, image, external URL, order
   (Projects and Portfolio MERGED — do not split)
5. `testimonials` — name, avatar, quote, rating, order
6. `stats` — label, number
7. `contact_messages` — inbox

Plus Supabase's `auth.users`. If you think a table is missing, GRILL —
don't add silently.

### Editable vs not editable

- **Editable via admin**: all headings, intros, hero phrases, list
  items, images, contact details, social links, SEO, section labels
- **Not editable** (code-level, fork-time only): colors, fonts,
  layout, section order, section on/off toggles

### Cut from V1 (do not build, do not stub)

Booking, payments, i18n, blog, promo modal, project/portfolio detail
pages, self-serve password reset.

Each work card links to an external URL. Password reset is manual via
the Supabase dashboard.

### Auth

- Two users per site: client + support user for me
- Admin route: `/studio` (not `/admin`, not `/panel`)
- Real Supabase Auth. Path obscurity is not the security layer.

### Images

- Compress in the browser before upload
- Hard reject over 2MB post-compression with a clear error message
- One Supabase Storage bucket, public read, authenticated write,
  RLS on

### Row Level Security (non-negotiable)

- Public SELECT: `site_settings`, `skills`, `experiences`, `works`,
  `testimonials`, `stats`
- Public CANNOT read: `contact_messages`, `auth.users`
- Only authenticated users can INSERT/UPDATE/DELETE, EXCEPT the
  public contact form which INSERTs into `contact_messages`

### Design tokens

`src/theme.ts`: two color tokens (primary, accent) and one font
family. Every UI element reads from these. Forks restyle by editing
this one file.

---

## Repo files you maintain

- `README.md` — what this is, local dev, env vars
- `FORKING.md` — step-by-step to fork the base for a new client
- `CONTEXT.md` — shared vocabulary (base, fork, section label, work
  item, site settings, studio) so sessions don't drift
- `SCHEMA.md` — all seven tables, columns, types, RLS, one place
- `CHANGES.md` — dated log of base changes, for porting into forks
- `DECISIONS.md` — settled decisions, grouped by topic, dated


- GitHub Actions CI: `pnpm test`, `pnpm typecheck`, `pnpm lint`,
  `pnpm build` on every push and PR
- Vercel preview deployments per branch (default behavior)

- Commits are authored by me (SAHEED2010), not Claude. Do NOT add
  `Co-Authored-By: Claude` trailers or any "Generated with Claude
  Code" lines to commit messages. Use my git config as-is.
