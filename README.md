# Portfolio base template

The **base template** for a portfolio-site service. This repo is not a
client site — it is the neutral thing each client site is forked from.

Everything a visitor reads comes from the database, so a fork is
mostly content entry plus a theme file, not a rewrite.

| doc | what's in it |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | How work is done here, and what's settled |
| [`DECISIONS.md`](DECISIONS.md) | Settled decisions, dated, with reasoning |
| [`SCHEMA.md`](SCHEMA.md) | The seven tables, columns, RLS, storage bucket |
| [`FRONTEND_SPEC.md`](FRONTEND_SPEC.md) | What the public page looks like and why |
| [`CONTEXT.md`](CONTEXT.md) | Shared vocabulary — read this first if you're new |
| [`FORKING.md`](FORKING.md) | Base → client site, step by step |
| [`CHANGES.md`](CHANGES.md) | Dated log of base changes, for porting into forks |

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase
(Postgres + Storage + Auth) · Vercel · pnpm

## Local development

### Prerequisites

- **Node.js 20+**
- **pnpm — required, not optional.** This repo has a `pnpm-lock.yaml`
  and a `.npmrc` that pnpm reads. Running `npm install` or
  `yarn install` creates a second lockfile, resolves a different
  dependency tree, and the two will drift silently. If you have just
  cloned a fork: **use pnpm.**
  ```bash
  npm install -g pnpm
  ```
- **Docker Desktop**, running — the local Supabase stack needs it.

### Setup

```bash
pnpm install

# Starts Postgres, PostgREST, Auth, Storage and Studio in Docker.
# First run pulls several GB of images; later runs take seconds.
pnpm exec supabase start
```

`supabase start` prints an API URL, an anon key and a service role
key. Put the first two in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
```

Then:

```bash
pnpm dev          # http://localhost:3000
```

### Environment variables

| variable | where | notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local`, Vercel | Project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local`, Vercel | Safe to expose — it is governed by RLS |

The **service role key is never used by the site** and must never be
committed or added to Vercel. It bypasses RLS entirely; it belongs
only in local smoke-test commands.

`.env*` is gitignored.

## Scripts

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # ESLint
pnpm exec tsc --noEmit   # type check
```

### Database

```bash
pnpm exec supabase start      # boot the local stack
pnpm exec supabase stop       # shut it down (frees ~1.3GB RAM)
pnpm exec supabase db reset   # re-run all migrations + seed.sql
pnpm exec supabase migration up   # apply pending migrations only
```

`supabase/seed.sql` holds placeholder content so the site renders as a
real portfolio on first run. A fork replaces it.

### Smoke tests

These prove the RLS policies actually work, rather than merely
existing. Run them after any schema change:

```bash
SUPABASE_URL=http://127.0.0.1:54321 \
SUPABASE_ANON_KEY=<anon> \
SUPABASE_SERVICE_ROLE_KEY=<service_role> \
  node scripts/rls-smoke-test.mjs      # 9 assertions

# same env vars
  node scripts/storage-smoke-test.mjs  # 5 assertions
```

## Local development gotchas

**Installing the Supabase CLI can fail for memory reasons that look like
network reasons.** `pnpm add -D supabase` pulls a single 59.38 MB platform
binary (`@supabase/cli-windows-x64`), and pnpm restarts that download from
zero on every retry — so a slow or interrupted connection never makes
forward progress. On a machine low on free RAM (we hit 150 MB free, with
Chrome holding several GB), the install gets OOM-killed partway through and
reports a timeout, which sends you chasing the network instead of the real
cause. If it fails repeatedly: close memory-heavy apps first, then retry.
To confirm the network itself is fine, `curl -C - -o /tmp/cli.tgz <tarball
url>` resumes across attempts and will complete where pnpm cannot.

**`Prefer: return=representation` breaks the contact form insert.** Anon
has INSERT but no SELECT on `contact_messages`, so asking PostgREST to
read the new row back fails the whole request with
`new row violates row-level security policy`. This is correct RLS
behaviour, not a bug — just never add that header to that insert.

**Docker's WSL VM holds ~1.3 GB while Supabase runs.** On a memory-tight
machine, `supabase stop` frees it; the built site keeps serving because
pages are statically prerendered.
