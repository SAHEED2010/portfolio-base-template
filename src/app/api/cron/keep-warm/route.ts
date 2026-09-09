import { NextRequest, NextResponse } from "next/server";

// Keeps the Supabase free-tier project from pausing after ~7 days of
// inactivity (DECISIONS.md, Accounts and ownership). One cheap read,
// once daily — daily is the maximum invocation frequency Vercel's
// Hobby plan allows for cron jobs at all (confirmed against Vercel's
// docs before building this, not assumed), so it isn't a conservative
// choice, it's the ceiling. That still leaves a ~6-day safety margin
// against Supabase's pause window.
//
// Uses the ANON key, like every other route in this app — NOT the
// service role key. Do not "upgrade" this to service role: the first
// version of this route did exactly that, reasoning that a cron
// trigger has no user session to authorize against. That reasoning
// was wrong in a way that only shows up at deploy time — FORKING.md
// explicitly tells forks to never put the service role key in
// Vercel, so a route that REQUIRES it there would 500 on every
// invocation in production while appearing to work in local dev
// (where a developer's own .env.local can hold that key for other
// reasons). It doesn't need to be service role anyway: site_settings
// has a public SELECT RLS policy, so the anon key reads it exactly as
// well. If a future change to this route ever needs to read a table
// that ISN'T public-read, that's a sign the route should pick a
// different table, not reach for service role.
//
// Auth: Vercel's documented CRON_SECRET pattern. When that env var is
// set on the Vercel project, Vercel automatically attaches it as
// `Authorization: Bearer <CRON_SECRET>` on every invocation it makes
// of this route. Without this check, the route is a public GET
// endpoint anyone could hit — cheap individually, but still an
// unauthenticated door into hitting your database on a schedule you
// don't control.
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("[cron/keep-warm] missing Supabase env vars");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Cheapest real read available: one row, one column, no joins. The
  // point is only to touch Postgres, not to check anything about the
  // data itself.
  const res = await fetch(`${url}/rest/v1/site_settings?select=key&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`[cron/keep-warm] Supabase read failed: HTTP ${res.status}`);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}
