import { NextRequest, NextResponse } from "next/server";

// Keeps the Supabase free-tier project from pausing after ~7 days of
// inactivity (DECISIONS.md, Accounts and ownership). One cheap read,
// once daily — daily is the maximum invocation frequency Vercel's
// Hobby plan allows for cron jobs at all (confirmed against Vercel's
// docs before building this, not assumed), so it isn't a conservative
// choice, it's the ceiling. That still leaves a ~6-day safety margin
// against Supabase's pause window.
//
// This is the one route in the app that talks to Supabase with the
// SERVICE ROLE key — legitimate here specifically because it has no
// user context to authorize against (a cron trigger isn't a visitor
// or a studio session) and RLS would otherwise block an unauthenticated
// read of a table that requires it. Every other route in this app
// uses the anon key; see lib/db.ts and lib/supabase/server.ts.
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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("[cron/keep-warm] missing Supabase env vars");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Cheapest real read available: one row, one column, no joins. The
  // point is only to touch Postgres, not to check anything about the
  // data itself.
  const res = await fetch(`${url}/rest/v1/site_settings?select=key&limit=1`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`[cron/keep-warm] Supabase read failed: HTTP ${res.status}`);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}
