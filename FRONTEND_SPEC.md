# FRONTEND_SPEC.md

The public homepage, specified before it was built. Self-contained on
purpose: a future session or a fork should be able to read only this
file and know what the base looks like without opening the code.

Scope: the one-page public site at `/`. The `/studio` admin is not
covered here.

Section order (single scrolling page):
`hero → about → skills → experiences → works → testimonials → contact → footer`

Design decisions and their reasoning live in **DECISIONS.md**
(Design tokens section). Table shapes live in **SCHEMA.md**. This file
is the *layout* reference — what goes where, at what size, and why.

---

# Part 1 — Shared foundations

Everything in Part 2 inherits from here. These were established
building the hero and are **not reopened** per section.

## 1.1 Tokens

Source of truth: `src/theme.ts` mirrored into `src/app/globals.css`
as Tailwind v4 `@theme` tokens. A fork restyles by editing those two.

| token | value | used for |
|---|---|---|
| `primary` | `#14181C` | body text, dark testimonials band |
| `accent` | `#2E6E68` | CTAs, links, rules, focus ring |
| `accent-hover` | `#245853` | filled button hover |
| `accent-light` | `#3E8A83` | **accent on dark backgrounds only** |
| `neutral-50` | `#FAF9F7` | page background |
| `neutral-100` | `#F4F2EF` | placeholder surfaces |
| `neutral-200` | `#E8E4DF` | hairline dividers, input borders |
| `neutral-300` | `#D6D1CA` | placeholder letterforms, empty dots |
| `neutral-400` | `#A9A29A` | index numbers, de-emphasised meta |
| `neutral-500` | `#7D766D` | eyebrows, dates, captions |
| `neutral-600` | `#5C5650` | body copy, intros |
| `neutral-700` | `#423E39` | secondary button text |

**Accent on dark:** `accent` (`#2E6E68`) does not carry enough contrast
against `primary` (`#14181C`). Inside the testimonials band, any accent
text or mark uses `accent-light` (`#3E8A83`).

**This table is the light-mode / always-fixed layer.** Six of these
roles (background, body text, muted text, borders, surfaces, accent-
as-text) also have theme-reactive dark variants, and the testimonials
band's four (`primary`, `neutral-50`, `neutral-400`, `accent-light` as
used there) are fixed on purpose rather than swapped — see **§1.13
Dark mode** for both the reactive token set and why the anchor band
doesn't move.

## 1.2 Fonts

- **Fraunces** (`--font-display`, class `.font-display`) — variable
  serif. Headings, work titles, quotes, stat numbers, placeholder
  letterforms. `SOFT 0, WONK 0` for restraint.
- **Inter** (`--font-body`) — everything else: body copy, labels,
  dates, buttons, form fields, nav.

Rule of thumb: **Fraunces is for things you look at, Inter for things
you read.** A heading is Fraunces; the paragraph under it is Inter.

## 1.3 Layout container

Every section uses the same container, so left edges align down the
whole page:

```
max-width:      var(--measure)  = 72rem
padding-inline: var(--gutter)   = clamp(1.25rem, 5vw, 2.5rem)
margin-inline:  auto
```

Grids are 12-column (`lg:grid-cols-12`). Established ratios:

| use | ratio |
|---|---|
| Hero | content 7 / portrait 5 |
| Contact | details 5 / form 7 |
| Experience row | date rail 3 / content 9 |

Only Contact and Experiences use split columns. About, Skills, Works
and Testimonials are full-width — deliberately, so the page does not
read as a stack of identical two-column blocks.

## 1.4 Vertical rhythm

| gap | value |
|---|---|
| Section padding-block | `var(--section-y)` = `clamp(5rem, 12vw, 9rem)` |
| Eyebrow → heading | `1.25rem` (`mt-5`) |
| Heading → intro | `1rem` (`mt-4`) |
| Section header → content | `3rem`, `lg:4rem` (`mt-12 lg:mt-16`) |
| Between list rows | `2rem`–`2.5rem` padding, hairline divider |
| Grid gaps | `2rem`, `lg:3rem` (`gap-8 lg:gap-12`) |

## 1.5 Section header pattern

**Every section in Part 2 opens with this exact block.** It is the
main thing making six different layouts read as one page, and it
reuses the rule-and-eyebrow motif from the hero.

```
[— accent rule 2rem × 1px]  EYEBROW (section label)
Heading in Fraunces
Intro paragraph in Inter, max-width 42rem
```

- **Rule**: `h-px w-8 bg-accent` (`bg-accent-light` on dark)
- **Eyebrow**: the section's `label_*` setting, Inter,
  `text-xs uppercase tracking-[0.22em] text-neutral-500`
- **Heading**: the section's `*_heading` setting, Fraunces,
  `text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight`
- **Intro**: the section's `*_intro` setting, Inter,
  `text-lg leading-relaxed text-neutral-600 max-w-2xl`

## 1.6 Type scale, relative to hero

The hero is the largest thing on the page; nothing else competes.

| element | size | font |
|---|---|---|
| Hero `h1` | `text-5xl → sm:text-6xl → lg:4.25rem` | Fraunces |
| Section `h2` | `text-3xl → sm:text-4xl → lg:text-5xl` | Fraunces |
| Card / row title `h3` | `text-xl → sm:text-2xl` | Fraunces |
| Stat number | `text-4xl → lg:text-5xl` | Fraunces |
| Pull quote | `text-xl → lg:text-2xl` | Fraunces |
| Intro paragraph | `text-lg` | Inter |
| Body / description | `text-base` | Inter |
| Meta (dates, org, captions) | `text-sm` | Inter |
| Eyebrow / label / index | `text-xs` | Inter |

## 1.7 Motion

Reuses the hero's tokens. Nothing new is introduced.

| animation | spec |
|---|---|
| Ease | `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-out-soft`) |
| Scroll reveal | opacity 0→1, `translateY(1.25rem)`→0, **600ms** |
| Hero entrance | `rise-in`, **700ms**, staggered |
| Child stagger | **60–80ms** apart (40ms for long lists) |
| Colour hover | **200ms** |
| Transform hover | **300–400ms** |

Rules:

- Each section is wrapped in `<Reveal>` — the IntersectionObserver
  wrapper from `src/components/reveal.tsx`, which only toggles a
  class. Fires once (`observer.disconnect()`), because re-animating
  on every scroll-past is irritating.
- Children stagger via `Reveal`'s `delay` prop, in reading order.
- **No scroll-snap between sections** — it fights natural reading on
  a long page. Scroll-snap is used *within* the testimonials track only.
- **No parallax.** Autoplaying motion (marquee, carousel drift) is
  allowed only where it can be paused by hover, focus, and an explicit
  touch control — and where `prefers-reduced-motion` collapses it to
  static or hands the track back to normal scroll. This is what the
  testimonials marquee actually does (§2.5); it is the standard for
  any future autoplaying element, not an exception to a blanket ban.
- Every animation is decorative, so all of it is disabled by the
  global `prefers-reduced-motion` rule in `globals.css`.

Each animation must be defensible in one sentence. Where one exists
below, the reason is stated.

## 1.8 Placeholder treatment

The base ships **no binary image assets**, so every image slot must
look intentional when empty. One consistent treatment, established by
the hero portrait:

> Gradient surface `from-neutral-100 via-neutral-100 to-accent/15`,
> with a letterform centred in Fraunces at `text-neutral-300`.

The letterform is the subject's initials (person) or first character
(work title). Container keeps the same radius and aspect ratio as the
real image, so nothing reflows when a fork uploads one.

Radii: `rounded-[1.75rem]` for large panels (hero portrait),
`rounded-[1.25rem]` for cards, `rounded-full` for buttons and avatars.

## 1.9 Backgrounds and the one anchor break

**`neutral-50` for the entire page — with exactly one exception:
testimonials sits on `primary` (`#14181C`).**

This is the strongest visual call in the design. Seven sections of
identical background across a long scroll goes monotone; alternating
every other section is the template tell. One dark anchor band breaks
the scroll, gives the page a memorable moment, and quotes set on dark
is a genuinely editorial move.

A fork wanting a lighter feel throughout can override that single
section background in one line. **The base default is the stronger
choice, deliberately.**

The band is full-bleed (edge to edge, no rounding) so it reads as an
architectural break rather than a card.

## 1.10 Empty-state rule

**If a section's underlying table has zero rows, the whole section
does not render — and its nav link disappears with it.**

A fork with no testimonials must not show an empty "Kind words"
heading; that reads broken, not minimal.

| section | hidden when |
|---|---|
| About | `about_heading` and `about_intro` both empty |
| About stats row | `stats` empty (heading/intro still render) |
| Skills | `skills` empty |
| Experiences | `experiences` empty |
| Works | `works` empty |
| Testimonials | `testimonials` empty |
| **Contact** | **never** — it depends on no rows |
| Footer | never |

Nav construction: an item appears only if its `label_*` setting is
non-empty **and** its section will render.

## 1.11 Data flow

All reads happen in `src/app/page.tsx`, a server component, via
`selectRows()` in `src/lib/db.ts` — plain `fetch` against PostgREST
with the anon key, so the public site is subject to RLS exactly like a
browser. Results are passed down as props; **no section fetches its
own data**, and no section is a client component.

Client islands are only: `RotatingText`, `Reveal`, `SiteHeader`, and
the contact form.

Cached with `next: { revalidate: 60 }` — studio edits appear within a
minute without hitting the DB per render.

## 1.12 Accessibility baseline

- One `h1` (hero). Every section heading is `h2`; card titles `h3`.
- Focus ring: global `:focus-visible` — 2px `accent`, 3px offset.
- Form inputs have **visible labels**, not placeholder-only.
- Form status is announced via `aria-live`.
- Decorative elements (rules, gradients, letterforms) are
  `aria-hidden`; placeholders carry `sr-only` text where meaningful.
- Anchor targets clear the sticky header via `scroll-padding-top: 5rem`.

## 1.13 Dark mode

Three states — **system** (default), explicit **light**, explicit
**dark** — on both the public site and the studio. Colours stay
non-editable (`DECISIONS.md` unchanged elsewhere): this is a second
CSS token set switched by `data-theme`, never exposed through
`site_settings` or the field map.

**Mechanism.** No attribute on `<html>` means system: a plain
`@media (prefers-color-scheme: dark)` query tracks the OS live, with
zero JS. An explicit choice sets `data-theme="dark"` or
`data-theme="light"`, which always wins over the OS regardless. The
choice is resolved by an inline, synchronous script
(`src/lib/theme-script.ts`) that runs before first paint and sets the
attribute via a plain DOM call — never through React, so the
server-rendered `<html>` (which carries no `data-theme` prop at all)
never disagrees with the client and no hydration-mismatch warning is
possible. One `localStorage` key ("theme") covers both the public
site and the studio: the whole app renders exactly one `<html>`
(`src/app/studio/layout.tsx` returns a bare fragment, not its own
`<html>`), so there's one origin and one store regardless of which
page a visitor hits first. `ThemeToggle` (`src/components/
theme-toggle.tsx`) is three real buttons — System / Light / Dark —
each with `aria-pressed`, not an icon that silently swaps meaning.

**Token architecture.** Six tokens are theme-reactive, redefined
under both the media query and `[data-theme="dark"]`:

| token | light | dark | role |
|---|---|---|---|
| `--color-page` | `#FAF9F7` | `#17181A` | page background |
| `--color-ink` | `#14181C` | `#EDEAE4` | body text |
| `--color-muted` | `#7D766D` | `#9A9488` | secondary text — labels, dates, captions |
| `--color-border` | `#E8E4DF` | `#6B6E72` | hairlines: dividers AND component boundaries |
| `--color-surface` | `#FFFFFF` | `#1E2023` | cards, studio form fields |
| `--color-accent-text` | `#2E6E68` | `#4F9992` | accent used AS TEXT on the page (links, tagline) |

Values are designed and contrast-checked on their own — not a
mechanical inversion of the light palette. `--color-border`'s dark
value in particular was raised from an initial `#34373B` (1.5:1,
calibrated for decorative dividers) to `#6B6E72` (3.19–3.47:1) after
checking that every studio surface (list rows, Overview tiles, form
inputs) carries **zero shadow** and relies on the border alone to
separate a card from the page — a structural boundary (WCAG 1.4.11),
not a decorative one. `--color-accent-text` exists because plain
`--color-accent` fails at 3.0:1 for text-sized use against the dark
page background — the same problem already solved once for the
testimonials band below, requiring its own fix here too.

**Anchor decoupling.** Four tokens stay **fixed** across both
themes — the testimonials dark band (§1.9) does not change when the
rest of the page does, or "one break in an otherwise uniform page"
loses its meaning the moment the whole page is already dark:

| token | value (both themes) | mirrors |
|---|---|---|
| `--color-anchor` | `#14181C` | the band's background |
| `--color-anchor-fg` | `#FAF9F7` | quote text |
| `--color-anchor-muted` | `#A9A29A` | name / meta |
| `--color-anchor-accent` | `#3E8A83` | rating dots, rule |

**Verified, not assumed, at build time:** the homepage's static
prerendering survives dark mode intact (`○ Static` in the build
output) — theme resolution is entirely client-side, nothing touches a
cookie or header at request time.

---

# Part 2 — Section specs

Anchor ids: `#about`, `#skills`, `#experiences`, `#works`,
`#testimonials`, `#contact`.

---

## 2.1 About

**Layout** — Full-width, single column. Deliberately *not* the hero's
7/5 split: repeating that immediately below the hero reads mechanical.
Header block and intro capped at `max-w-2xl` (~65ch) for readability;
the stats row spans the full container beneath it.

**Content**

| element | source |
|---|---|
| Eyebrow | `site_settings.label_about` |
| Heading | `site_settings.about_heading` |
| Intro | `site_settings.about_intro` |
| Stats (4-up) | `stats` table, `order=display_order.asc` |

Each stat: `number` above, `label` beneath.

**Typography** — Section header pattern (§1.5). Stat number Fraunces
`text-4xl lg:text-5xl` in `primary`; stat label Inter
`text-sm text-neutral-500`, `uppercase tracking-[0.12em]`.

**Spacing** — `var(--section-y)` block padding. Header → stats row
`mt-16 lg:mt-20`. Stats separated by hairline vertical dividers
(`border-l border-neutral-200`) at `lg`, dropped below that.

**Motion** — Section `<Reveal>`. Stats stagger **80ms** each, left to
right — the eye reads a row of numbers sequentially, so they arrive
in that order.

**Responsive**

| width | behaviour |
|---|---|
| 375 | Stats 2×2 grid, no dividers, `gap-8` |
| 768 | Stats 2×2, `gap-10` |
| 1280 | Stats 4-up in one row, vertical hairline dividers |

**Empty states** — No stats rows → heading and intro render alone, no
stats row, no leftover spacing. Heading and intro both empty → section
and nav link hidden.

---

## 2.2 Skills

**Layout** — Full-width. Header block, then an editorial list: two
balanced columns at `lg`, one below. Chosen over tag pills (the
template look) and over bars — `skills` has only `name` and
`display_order`, and **"Typography 85%" would be a fabricated number
that undermines credibility on a designer's portfolio.**

**Content**

| element | source |
|---|---|
| Eyebrow | `site_settings.label_skills` |
| Heading | `site_settings.skills_heading` |
| Intro | `site_settings.skills_intro` |
| Rows | `skills` table, `order=display_order.asc` |

Each row: zero-padded index (`01`, `02`, …, derived from position, not
stored) + `name`.

**Typography** — Index Inter `text-xs text-neutral-400`, tabular
figures. Name Inter `text-lg lg:text-xl font-medium text-ink`.

**Spacing** — Rows `py-5`, separated by `border-b border-neutral-200`
hairlines. Column gap `lg:gap-x-16`.

**Motion** — Section `<Reveal>`. Rows stagger **40ms** (shorter than
the 80ms default because the list is long and 80ms would drag).
Hover: name → `accent`, index → `accent`, 200ms.

**Responsive**

| width | behaviour |
|---|---|
| 375 | 1 column, full-width rows |
| 768 | 1 column |
| 1280 | 2 columns, balanced fill |

**Empty states** — No rows → section and nav link hidden.

---

## 2.3 Experiences

**Layout** — Full-width. Each entry is a 12-column row: **date rail
`lg:col-span-3`, content `lg:col-span-9`**, with a hairline divider
between entries. Chosen over a card grid (fragments what is really a
chronological list) and over a dotted timeline (the most
template-coded option). This reads like a well-set CV.

**Content**

| element | source |
|---|---|
| Eyebrow / Heading / Intro | `label_experiences`, `experiences_heading`, `experiences_intro` |
| Rows | `experiences`, `order=display_order.asc` |

Each row:
- **Date range** — from `start_date` / `end_date`, formatted
  `Mar 2021 — Present` (null `end_date` renders "Present")
- **Title** — `title`
- **Org** — `org`, preceded by `logo_url` as a small round mark
  (20px) when present, omitted entirely when not
- **Type** — `type` as a quiet label. Free text, so it is **displayed
  only, never used for grouping or branching** — we cannot rely on its
  values across forks.
- **Description** — `description`, capped `max-w-2xl`

**Typography** — Date Inter `text-sm text-neutral-500`, tabular.
Title Fraunces `text-xl sm:text-2xl`. Org Inter `text-base
text-neutral-600`. Type Inter `text-xs uppercase tracking-[0.16em]
text-neutral-400`. Description Inter `text-base text-neutral-600`.

**Spacing** — Rows `py-8 lg:py-10`, `border-b border-neutral-200`
between (not after the last).

**Motion** — Section `<Reveal>`. Rows stagger **80ms** — reinforces
reading down a chronology.

**Responsive**

| width | behaviour |
|---|---|
| 375 | Stacked: date above title, all left-aligned |
| 768 | Stacked, same |
| 1280 | Date rail left (3 cols), content right (9 cols) |

**Empty states** — No rows → section and nav link hidden. Individual
nullable fields (`logo_url`, `description`, `type`, `end_date`) each
omit cleanly without leaving gaps.

---

## 2.4 Works

**Layout** — Full-width, **2-column grid** at `md` and up. Three
columns would turn work into thumbnails; two gives each project
presence, which is the entire point of "selected work."

**Content**

| element | source |
|---|---|
| Eyebrow / Heading / Intro | `label_works`, `works_heading`, `works_intro` |
| Cards | `works`, `order=display_order.asc` |

Each card: image area (`image_url`), `title`, `subtitle`, arrow
affordance. **The whole card is a single `<a href={external_url}>`**
with `target="_blank" rel="noopener noreferrer"` — there are no detail
pages in V1 (DECISIONS.md, V1 scope).

**Image area** — `aspect-[4/3]`, `rounded-[1.25rem]`,
`overflow-hidden`. Empty `image_url` → §1.8 placeholder using the
first character of `title`.

**Typography** — Title Fraunces `text-xl sm:text-2xl`. Subtitle Inter
`text-sm text-neutral-500`.

**Spacing** — Grid `gap-8 lg:gap-12`. Image → title `mt-5`,
title → subtitle `mt-1.5`.

**Motion** — Section `<Reveal>`, cards stagger **80ms**. Hover:
image `scale(1.03)` over 400ms, title → `accent` over 200ms, arrow
`translate-x-0.5`. The scale is the standard signal that a card is a
link, and it is the only transform on the page besides the hero.

**Responsive**

| width | behaviour |
|---|---|
| 375 | 1 column |
| 768 | 2 columns, `gap-8` |
| 1280 | 2 columns, `gap-12` |

**Empty states** — No rows → section and nav link hidden. Missing
`image_url` → placeholder. Missing `subtitle` → omitted, no gap.

---

## 2.5 Testimonials — **the dark band**

**Layout** — Full-bleed `primary` (`#14181C`) background, edge to
edge, no rounding (§1.9). Inside, the standard container. Header
block, then a **continuous horizontal marquee** with a pause/play
control beneath it, right-aligned to the container.

Chosen over a static grid because quotes vary in length — a grid
produces ragged card heights and a wall of text.

**Marquee mechanics** — the card set is rendered **twice**; the track
translates `0 → -50%`, which lands on an identical frame so the loop
never visibly jumps. The second pass is `aria-hidden` so screen
readers don't announce every quote twice. 60s per loop: slow, because
these are sentences to read, not a ticker.

**Stopping it is mandatory, not optional** — auto-moving content
requires a pause mechanism (WCAG 2.2.2):

| user | mechanism |
|---|---|
| Mouse | pause on `:hover` |
| Keyboard | pause on `:focus-within` |
| **Touch** | **the explicit pause/play button** — hover and focus don't exist here, so without it a phone user cannot stop the motion |
| Reduced-motion | animation off entirely; track becomes a normal `overflow-x: auto` scroller |

The control is icon-only and quiet — hairline pause bars echoing the
rule motif, or a small triangle when paused — on a 44px target with
`aria-pressed`.

**Colour inversion inside this band:**

| element | colour |
|---|---|
| Background | `primary` |
| Quote text | `neutral-50` |
| Name / meta | `neutral-400` |
| Eyebrow | `neutral-400` |
| Accent rule, filled rating dots | **`accent-light`** (contrast) |
| Empty rating dots | `neutral-700` |
| Card surface | `white/[0.04]` with `border-white/10` hairline |

**Content**

| element | source |
|---|---|
| Eyebrow / Heading / Intro | `label_testimonials`, `testimonials_heading`, `testimonials_intro` |
| Cards | `testimonials`, `order=display_order.asc` |

Each card: rating dots, `quote`, `avatar_url` (or initials
placeholder), `name`.

**Rating** — `rating` is nullable, so **cards with no rating render no
dots at all** (the seed deliberately includes one such row to prove
this path). When present: **five small filled circles, 5px**, filled
`accent-light` up to the rating, remainder `neutral-700`. Circles, not
stars — five gold stars reads review-site; small monochrome dots read
studio.

**Typography** — Quote Fraunces `text-xl lg:text-2xl leading-snug`.
Name Inter `text-sm text-neutral-400`.

**Spacing** — Track `gap-6`, `scroll-padding-inline` matching
`var(--gutter)`, scrollbar hidden. Card padding `p-8 lg:p-10`.

**Motion** — Section `<Reveal>` on the header. The track itself has
no entrance stagger — cards arrive horizontally, so a vertical
stagger would fight the axis. Card border lightens on hover.

**Responsive** — card widths sized so more than one card is always
partially visible, which is what reads as "this is a moving set":

| width | card width |
|---|---|
| 375 | `85vw` |
| 768 | `min(60vw, 26rem)` |
| 1280 | `24rem` |

**Empty states** — No rows → the entire dark band is hidden, and the
page stays uniform `neutral-50`. Missing `avatar_url` → initials
placeholder. Null `rating` → no dots.

---

## 2.6 Contact

**Layout — stacked, in priority order.** Not a details/form split.

```
Section header (eyebrow · heading · intro)
Primary message button  +  secondary channel links
Email · location · socials
────────────── hairline ──────────────
Form label
Form (max-w-xl)
```

**Two paths, deliberately unequal.** Direct-message channels are the
primary action — visitors arrive from WhatsApp and Instagram on
phones, where tapping through to a messaging app converts far better
than filling a form. The form stays as the fallback for recruiters
and formal enquiries, and is the **only** path that populates
`contact_messages` and the studio inbox.

A side-by-side split was rejected: it gives both equal visual weight,
which is the opposite of the intended priority. Vertical order states
it plainly. The split also only ever did work on desktop — at 375px
it collapsed to this same stack.

**Content — message channels**

| element | source |
|---|---|
| Eyebrow / Heading / Intro | `label_contact`, `contact_heading`, `contact_intro` |
| Channels | `contact_channels` — jsonb array of `{label, url, primary?}` |
| Email | `contact_email` → `mailto:`, shown as readable text (people copy an address as often as they click it) |
| Location | `contact_location` |
| Socials | `social_links` |

`contact_channels` mirrors the `social_links` shape plus an optional
`primary: true`. Exactly one entry renders as the filled accent
button; the rest render as quiet underlined links, so there is one
obvious action rather than a row of equal choices. **Fallback rule:**
first entry flagged `primary` wins; if none (or several) are flagged,
the first entry is used — a malformed array still renders a primary
action instead of none.

**Content — form** → inserts into `contact_messages`

| field | validation |
|---|---|
| Name | required, non-empty |
| Email | required, email format |
| Message | required, non-empty |

- Submitted via a **server action**, not an API route — writes go
  through server actions per `CLAUDE.md`.
- Anon INSERT into `contact_messages` is already proven by the RLS
  smoke test.
- **No captcha in V1.** `ip_address` is stored hashed for future spam
  mitigation (SCHEMA.md).
- **No email notification on a new message.** The client checks
  `/studio/inbox` (Overview also surfaces an unread count). Resend was
  planned in the original stack but cut from V1 — deferred to V1.1
  because it needs per-fork domain verification `FORKING.md` doesn't
  yet document (`DECISIONS.md`, V1 scope).

**States**

| state | UI |
|---|---|
| Idle | Form, submit enabled |
| Invalid | Inline message under the offending field, `aria-describedby` |
| Submitting | Submit disabled, label → "Sending…" |
| Success | Form replaced by a confirmation, announced `aria-live="polite"` |
| Error | Inline error above submit, form preserved so nothing is retyped |

**Typography / fields** — Labels Inter `text-sm text-neutral-600`,
**always visible**. Inputs Inter `text-base`, `bg-white`,
`border border-neutral-200`, `rounded-xl`, `px-4 py-3`; focus uses the
global `:focus-visible` accent ring. Submit is the hero's filled
accent pill, identical treatment.

**Spacing** — Header → buttons `mt-8`. Buttons → details `mt-6`.
Details → hairline `mt-14 lg:mt-16`, then `pt-12` above the form
label. Fields `gap-5`.

**Motion** — Header and blocks via `<Reveal>`. Primary button arrow
shifts on hover; field focus grows a soft 4px accent ring over 300ms
(the field visibly receives focus, which matters most on mobile where
the keyboard covers half the screen). Nothing else — a form is not
the place for motion.

**Responsive** — the layout is already vertical, so it barely
changes; only the button row reflows.

| width | behaviour |
|---|---|
| 375 | Everything stacked; primary button full-width, secondary links wrap beneath |
| 768 | Primary button and secondary links share a row |
| 1280 | Same, form capped at `max-w-xl` |

**Empty states** — **Never hidden.** No `contact_channels` → the
whole button block is omitted and the form becomes the only path.
Missing `contact_email`, `contact_location`, `social_links` or
`contact_form_label` each omit their own line only.

---

## 2.7 Footer

**Layout** — Full-width, `border-t border-neutral-200`, `py-12`.
Not one of the six, but without it the page stops rather than ends.

**Content**

| element | source |
|---|---|
| Site title | `site_settings.site_title` (Fraunces, small) |
| Note | `site_settings.footer_note` |
| Socials | `site_settings.social_links` |
| Copyright | `© {current year} {site_title}` |

**Typography** — All Inter `text-sm text-neutral-500`, except the
title in Fraunces `text-base text-ink`.

**Motion** — None. The footer is not a moment.

**Responsive** — Stacked and centred at 375; single row,
`justify-between`, at `md`+.

**Empty states** — Never hidden. Missing `footer_note` or
`social_links` omit their line.

---

# Part 3 — Build checklist

Hard signals this build must close against (`CLAUDE.md` §4):

- [ ] `pnpm exec tsc --noEmit` clean
- [ ] `pnpm lint` clean
- [ ] `pnpm build` succeeds
- [ ] Dev server returns 200
- [ ] Every section's copy comes from `site_settings` — **no display
      string hardcoded in any component**
- [ ] Each section renders nothing (and drops its nav link) when its
      table is empty
- [ ] Contact form writes a real row to `contact_messages`
- [ ] Layout verified at 375 / 768 / 1280
- [ ] `prefers-reduced-motion` disables all animation
