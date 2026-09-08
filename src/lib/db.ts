// Read layer for public site data.
//
// Talks to Supabase's PostgREST endpoint with plain fetch rather than
// @supabase/supabase-js. Two reasons: no dependency, and Next's data
// cache works natively on fetch — the `next: { revalidate }` option
// below is what makes these reads cached-and-revalidated instead of
// hitting the DB on every render.
//
// Everything here uses the ANON key, so it is subject to RLS exactly
// like a browser would be. There is no privileged read path in the
// public site.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// How long a page can serve cached DB content before revalidating.
// Content changes via the studio are rare; a minute keeps the site
// fast without making edits feel stuck.
const REVALIDATE_SECONDS = 60;

export async function selectRows<T>(
  table: string,
  query = "select=*",
): Promise<T[]> {
  if (!SUPABASE_URL || !ANON_KEY) {
    // Missing env shouldn't blank the whole page during setup — it
    // should be obvious in the terminal and render an empty section.
    console.warn(
      `[db] NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY not set — "${table}" returned empty.`,
    );
    return [];
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    console.error(`[db] ${table} → HTTP ${res.status}: ${await res.text()}`);
    return [];
  }

  return (await res.json()) as T[];
}
