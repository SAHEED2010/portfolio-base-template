-- stats was the only list table without an explicit ordering column,
-- which made row order non-deterministic. Brings it in line with
-- skills / experiences / works / testimonials and lets a client
-- reorder the stat block from the studio.

alter table public.stats
  add column display_order integer not null default 0;
