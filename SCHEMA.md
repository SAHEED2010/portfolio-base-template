# SCHEMA.md

All seven tables, columns, types, and RLS in one place. Reasoning for
each shape decision lives in DECISIONS.md under "Schema" and "Schema
details" — this file is the current-state reference, not the history.

Conventions across every table:

- Primary key: `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`, kept current by a
  shared `set_updated_at()` trigger (defined once, attached per table)
- Ordering columns are named `display_order integer not null default 0`
  — never `order`, which is a reserved SQL keyword
- Image/logo/avatar columns store the **full public Supabase Storage
  URL** as `text`, not a storage path. Couples this schema to Supabase
  Storage specifically — accepted for V1.
- RLS is enabled on every table. Public (`anon`) role gets SELECT only
  where noted; all writes require `authenticated`.

---

## 1. `site_settings`

Key/value store for every piece of editable copy: section headings,
intros, hero rotating phrases, section labels (what a section is
CALLED for this client), SEO fields, social links, contact details.

| column       | type          | notes                              |
|--------------|---------------|-------------------------------------|
| `key`        | text          | primary key                        |
| `value`      | jsonb         | string, array, or object — see below |
| `created_at` | timestamptz   |                                     |
| `updated_at` | timestamptz   |                                     |

`value` is `jsonb` uniformly: a heading is a JSON string, hero
rotating phrases are a JSON array of strings, a setting that ever
needs structure (e.g. a social-links object) is a JSON object — no
schema change when a setting's shape changes.

RLS: public SELECT. Authenticated INSERT/UPDATE/DELETE.

---

## 2. `skills`

| column          | type        | notes |
|-----------------|-------------|-------|
| `id`            | uuid        | PK |
| `name`          | text        | not null |
| `display_order` | integer     | not null, default 0 |
| `created_at`    | timestamptz | |
| `updated_at`    | timestamptz | |

RLS: public SELECT. Authenticated INSERT/UPDATE/DELETE.

---

## 3. `experiences`

| column          | type        | notes |
|-----------------|-------------|-------|
| `id`            | uuid        | PK |
| `title`         | text        | not null |
| `org`           | text        | not null |
| `logo_url`      | text        | nullable — full public Storage URL |
| `start_date`    | date        | not null |
| `end_date`      | date        | nullable — null means "Present" |
| `type`          | text        | free text, unconstrained for V1 (see DECISIONS.md) |
| `description`   | text        | nullable |
| `display_order` | integer     | not null, default 0 |
| `created_at`    | timestamptz | |
| `updated_at`    | timestamptz | |

RLS: public SELECT. Authenticated INSERT/UPDATE/DELETE.

---

## 4. `works`

Projects and Portfolio merged — do not split back out (see
DECISIONS.md).

| column          | type        | notes |
|-----------------|-------------|-------|
| `id`            | uuid        | PK |
| `title`         | text        | not null |
| `subtitle`      | text        | nullable |
| `image_url`     | text        | nullable — full public Storage URL |
| `external_url`  | text        | not null — each work links out; no detail pages in V1 |
| `display_order` | integer     | not null, default 0 |
| `created_at`    | timestamptz | |
| `updated_at`    | timestamptz | |

RLS: public SELECT. Authenticated INSERT/UPDATE/DELETE.

---

## 5. `testimonials`

| column          | type        | notes |
|-----------------|-------------|-------|
| `id`            | uuid        | PK |
| `name`          | text        | not null |
| `avatar_url`    | text        | nullable — full public Storage URL |
| `quote`         | text        | not null |
| `rating`        | integer     | nullable, `CHECK (rating BETWEEN 1 AND 5)` |
| `display_order` | integer     | not null, default 0 |
| `created_at`    | timestamptz | |
| `updated_at`    | timestamptz | |

RLS: public SELECT. Authenticated INSERT/UPDATE/DELETE.

---

## 6. `stats`

| column          | type        | notes |
|-----------------|-------------|-------|
| `id`            | uuid        | PK |
| `label`         | text        | not null |
| `number`        | text        | free text, not integer — see DECISIONS.md |
| `display_order` | integer     | not null, default 0 |
| `created_at`    | timestamptz | |
| `updated_at`    | timestamptz | |

`display_order` was added in `20260908020000_stats_display_order.sql`
— it was missing from the original seven-table spec, which left stat
ordering non-deterministic.

RLS: public SELECT. Authenticated INSERT/UPDATE/DELETE.

---

## 7. `contact_messages`

Inbox for the public contact form. The only table the public can
INSERT into (nothing else) and the only table the public can NEVER
SELECT.

| column       | type        | notes |
|--------------|-------------|-------|
| `id`         | uuid        | PK |
| `name`       | text        | not null |
| `email`      | text        | not null |
| `message`    | text        | not null |
| `read`       | boolean     | not null, default false |
| `ip_address` | text        | nullable, SHA-256 hash — not raw IP, for basic spam-pattern matching |
| `created_at` | timestamptz | |

No `updated_at` — the only post-insert write is flipping `read`,
handled by the studio's authenticated UPDATE.

RLS: public (`anon`) INSERT only, no SELECT/UPDATE/DELETE.
Authenticated SELECT/UPDATE/DELETE, no INSERT (the form is the only
insert path, and it's public).

---

## Storage: the `media` bucket

Not a table, but RLS-governed and forked alongside the schema, so it
lives here too. Defined in `20260908010000_storage_media_bucket.sql`.

| property            | value                                      |
|---------------------|--------------------------------------------|
| `id` / `name`       | `media`                                     |
| `public`            | `true` — served from the public object URL, no signing |
| `file_size_limit`   | `2097152` (2 MiB)                           |
| `allowed_mime_types`| `image/jpeg`, `image/png`, `image/webp`     |

One bucket for every image type — portraits, work images, testimonial
avatars. The object path encodes which; that keeps the policy surface
to a single bucket.

Excluded on purpose: `image/svg+xml` (XSS vector on user upload) and
`image/gif` (large, animated, rarely wanted).

RLS on `storage.objects`, scoped to `bucket_id = 'media'`, mirroring
the six public-read tables: public SELECT; authenticated INSERT,
UPDATE, DELETE.

The 2 MiB bucket cap is deliberately redundant with the browser-side
compression cap — the browser layer gives a friendly error, the bucket
layer holds even if the browser layer is bypassed.

---

## Plus: `auth.users`

Supabase-managed. Two rows per site: client + support user. Not
listed as one of the seven — mentioned here so nobody goes looking
for an eighth table.
