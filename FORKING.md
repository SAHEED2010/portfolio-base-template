# FORKING.md

Base → one client's site. Read `CONTEXT.md` first if "base", "fork"
and "studio" aren't yet fixed terms for you.

Roughly 1–2 hours end to end, most of it content entry.

---

## Before you start

Per `DECISIONS.md`, **the client owns their Supabase project and
domain** and invites you as a collaborator. Never share passwords —
invites are revocable, passwords are not.

You'll need:

- A GitHub account with a new **empty repo** for this client
- The **client's** Supabase account (they create the project)
- Vercel (under you, the developer)
- The client's content: bio, work items, logos, portrait, testimonials

---

## 1. Copy the base

Fork/clone, then point it at the new repo:

```bash
git clone <base-repo-url> client-name-site
cd client-name-site
git remote set-url origin <new-client-repo-url>
pnpm install          # pnpm, not npm — see README
```

Record which base commit you forked from — you'll want it when
porting later base fixes:

```bash
git log -1 --format=%H > .forked-from
```

## 2. Create the client's Supabase project

The **client** creates it at supabase.com, then invites you.

Note the project's **API URL** and **anon key** (Settings → API).
Ignore the service role key — the site never uses it.

## 3. Apply the schema

```bash
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase db push
```

This applies all migrations in `supabase/migrations/`: the seven
tables, RLS on every one, and the `media` storage bucket.

**Verify RLS actually works before going further** — a
misconfiguration here exposes the client's inbox:

```bash
SUPABASE_URL=<project url> \
SUPABASE_ANON_KEY=<anon> \
SUPABASE_SERVICE_ROLE_KEY=<service role> \
  node scripts/rls-smoke-test.mjs      # expect 10/10

# same env vars
  node scripts/storage-smoke-test.mjs  # expect 5/5

# and, with the app running (APP_URL defaults to 127.0.0.1:3000)
  node scripts/studio-smoke-test.mjs   # expect 5/5
```

Do not continue on anything less than 10/10, 5/5 and 5/5.

## 4. Seed starting content

`supabase/seed.sql` is placeholder content for a fictional designer.
It exists so the base renders as a real portfolio — **it is not the
client's content.**

Either edit `seed.sql` with the client's real content and push it, or
push it as-is and have the client replace everything through the
studio. Editing the file first is usually faster for the initial load.

Do not ship a client site with "Mara Ellison" anywhere in it.

## 5. Lock down signup — do this BEFORE creating users

**This is a security step, not a preference.** Write RLS policies
grant to the `authenticated` role, so *anyone* who can self-register
gets write access to all six content tables. `/studio` being an
unusual path is irrelevant — the auth API is public and always
reachable.

Three things must all be off. Missing any one leaves the hole open:

- [ ] **`supabase/config.toml`** — `enable_signup = false` under
      **`[auth]` only**. Already set in the base; verify it survived
      your fork.

      ⚠️ **Leave `[auth.email] enable_signup = true`.** Despite the
      name it maps to GoTrue's `EXTERNAL_EMAIL_ENABLED`, so setting it
      false disables email **login** outright and locks both users out
      with "Email logins are disabled". The `[auth]` flag alone blocks
      signup — verified.
- [ ] **Hosted project** → Authentication → Sign In / Providers →
      **Email** → *Allow new users to sign up* **off**. This is a
      **separate setting from config.toml**, which only governs the
      local stack. Turning one off does not turn off the other.
- [ ] **Hosted project** → Authentication → Sign In / Providers →
      confirm **no OAuth provider is enabled** (Google, GitHub,
      Apple…). Email signup being off does not close a provider that
      is on — a live provider is a self-serve signup route straight
      past it.

Verify by attempting a signup against the hosted project. It must be
rejected:

```bash
curl -X POST '<project url>/auth/v1/signup' \
  -H "apikey: <anon key>" -H 'Content-Type: application/json' \
  -d '{"email":"probe@example.com","password":"probe-password-123"}'
```

A created user or a session in the response means the hole is still
open. Do not continue.

## 6. Create the two users

Supabase dashboard → Authentication → Users → **Add user** → *Create
new user*. Exactly two, both with **Auto Confirm User** on (there is
no confirmation email flow in V1):

1. **The client** — their real email
2. **Support** — yours

### How the client gets their password

There is **no self-serve reset**, so this cannot be left to the
client to figure out:

1. You set a password when creating the user — use a generated one,
   not a memorable one.
2. Send it to the client over something that isn't email-in-plaintext
   — a password manager share link, or read it to them.
3. Tell them plainly: **there is no "forgot password" link.** If they
   lose it, they contact you and you reset it from the dashboard
   (Authentication → Users → ⋯ → Reset password).
4. Have them sign in once while you're on the call. An account nobody
   has ever logged into is an account that fails the week you're
   unreachable.

The support account exists precisely so a locked-out client is a
phone call, not an outage.

## 7. Theme the site

`src/theme.ts` and the `@theme` block in `src/app/globals.css` are the
restyle surface. Change both together — they mirror each other.

| what | where |
|---|---|
| Two colours (primary, accent) + neutral ramp | `theme.ts` + `globals.css` |
| Display and body fonts | `layout.tsx` (`next/font/google`) + the token names |
| Spacing scale, motion durations | `theme.ts` / `globals.css` |

`FRONTEND_SPEC.md` documents what each token drives. Colours, fonts,
layout, section order and section on/off are **code-level, fork-time**
choices — deliberately not client-editable.

### Rename sections for this profession

No code change needed. In `site_settings`, edit the `label_*` keys —
"Work" → "Cases", "Publications", "Productions". The nav, headings and
anchors all follow.

## 8. Replace the base's placeholder identity

Easy to forget, visible if you do:

- [ ] `src/app/favicon.ico` — **still the stock Next.js icon.** Replace it.
- [ ] Open Graph image — the base ships none. Add `src/app/opengraph-image.png` (1200×630). These sites get shared into WhatsApp and Instagram, where the preview card is the first impression.
- [ ] `site_title`, `seo_description` in `site_settings`
- [ ] `hero_portrait_url` — until set, the hero shows an initials placeholder

## 9. Deploy to Vercel

Import the client repo. Set two environment variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Never add the service role key to Vercel.** It bypasses RLS.

Point the client's domain at the deployment (the client owns the
domain; you configure DNS).

### Keep the database warm

The Supabase free tier pauses a project after inactivity, which makes
a quiet portfolio 500 on the first visit after a lull. Add a weekly
Vercel cron that pings the DB (`DECISIONS.md`, Accounts and
ownership).

## 10. Hand over

- [ ] Client can sign in at `/studio`
- [ ] Client has edited one thing successfully while you watch
- [ ] They know password resets go through you
- [ ] Support account works

---

## Porting base fixes into a fork

Forks do not auto-receive base changes — accepted, with `CHANGES.md`
as the mitigation.

When you're in a fork for other reasons:

1. Read `CHANGES.md` in the base, from the commit in `.forked-from`
2. Port only what matters to this client
3. Re-run all three smoke tests if anything touched schema, RLS or a studio form
4. Update `.forked-from`

Resist porting everything. A fork that tracks the base perfectly is a
fork that didn't need to exist.
