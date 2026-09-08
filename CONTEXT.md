# CONTEXT.md

Shared vocabulary. Sessions drift when the same word means two things,
so these are fixed. If a term here stops matching reality, change this
file in the same commit as the code.

---

## base

**This repo.** The neutral template every client site is forked from.
It is deliberately boring: no client names, no professions, no
profession-specific copy, ever.

The base is not deployed to a client. It exists to be copied.

> Rule of thumb: if only one client needs it, it belongs in **their
> fork**. If both need it, it belongs in the **base**.

## fork

**One client's site.** A separate repo, copied from the base and
tailored: its own Supabase project, its own domain, its own content,
its own `theme.ts`.

Forks do **not** auto-receive base fixes. That's accepted — see
`DECISIONS.md`. `CHANGES.md` is the log you read when porting a base
fix into a fork by hand.

## studio

**The admin area, at `/studio`.** Not `/admin`, not `/panel`.

Where the client edits their own content. Two accounts per site: the
client, and a support account. Real Supabase Auth — the unusual path
is a small extra, never the security layer.

## site settings

**The `site_settings` table**: key/value, where `value` is `jsonb`.

Holds **every piece of display copy on the public site** — headings,
intros, hero phrases, section labels, SEO text, contact channels,
social links, the footer note. Nothing a visitor reads is hardcoded in
a component.

`jsonb` because a setting may be a string (`about_heading`), an array
(`hero_phrases`, `contact_channels`), or an object — with no schema
change when its shape changes.

## section label

**What a section is CALLED for this client** — stored as
`label_works`, `label_experiences`, and so on, in `site_settings`.

This is the cheap 80% of what a schema-driven system would give. A
lawyer's fork renames "Work" to "Cases" and an academic's to
"Publications" — the section heading, the nav link, and the anchor
label all follow, with no migration and no code change.

Distinct from the **section heading** (`works_heading`), which is the
sentence displayed inside the section. The label is the noun; the
heading is the line.

## work item

**One row in `works`** — a single project, case, or publication.

Projects and Portfolio from the original reference are **merged** into
this one table. Do not split them back out; that distinction belonged
to one person, not to portfolios generally.

Each work links to an **external URL**. There are no detail pages in
V1.

## the seven tables

`site_settings` · `skills` · `experiences` · `works` · `testimonials`
· `stats` · `contact_messages`

Plus Supabase's own `auth.users`. If an eighth table seems necessary,
that's a conversation, not a commit. Full shapes in `SCHEMA.md`.

## content tables vs the inbox

The **six content tables** are publicly readable — they are what the
site displays.

`contact_messages` is the **inbox**: the public can INSERT into it
(the contact form) and can never read it. It is the one table whose
rows visitors create rather than consume.

## placeholder treatment

The base ships **no binary image assets**. Every image slot renders a
gradient panel with a letterform when empty, so the base looks
intentional rather than broken before a client uploads anything.

## anchor break

The single dark section (testimonials) on an otherwise uniform
`neutral-50` page. Deliberate: one break in a long scroll is what
separates a designed page from a template. See `FRONTEND_SPEC.md`
§1.9.

## hard signal

A pass/fail check that can close a build loop without a human
judgement: tests pass, TypeScript compiles, ESLint passes, a migration
applies, a route returns 200, a form writes the expected row.

Visual design has **no** hard signal — which is why design work stops
and gets shown rather than looped on.
