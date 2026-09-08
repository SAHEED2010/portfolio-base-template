import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for server components and server actions.
//
// @supabase/ssr's job is cookie plumbing: the session lives in
// cookies, and this adapter lets the library read and write them
// through Next's cookie API. That's the whole reason for the
// dependency — the public site's plain fetch layer is stateless and
// needs none of this.
//
// ALWAYS the anon key. Studio writes are authorised by the user's JWT
// against RLS policies granted to the `authenticated` role. The
// service role key bypasses RLS entirely and appears nowhere in this
// app.

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server components can't set cookies. Harmless here:
            // middleware refreshes the session on every request, so
            // the write this swallows has already happened there.
          }
        },
      },
    },
  );
}

// Session check for server actions.
//
// Middleware already redirects unauthenticated users away from
// /studio, but middleware protects ROUTES, not actions — a server
// action is a POST endpoint that can be called directly. Every write
// re-checks for itself.
//
// getUser() rather than getSession(): getUser() revalidates the token
// against the auth server, while getSession() trusts whatever is in
// the cookie.
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return { supabase, user };
}
