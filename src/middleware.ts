import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Middleware does two things and no more:
//   1. Refreshes the auth token on every /studio request, writing the
//      rotated cookies onto the response.
//   2. Redirects unauthenticated users to the login page.
//
// It is NOT the authorisation boundary. Two layers sit behind it:
// every server action re-checks the session itself (middleware
// protects routes, not action endpoints), and RLS refuses
// unauthenticated writes at the database. A middleware bug leaks a
// VIEW at worst, never a write.

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Cookies go onto BOTH the request (so the rest of this
          // pass sees the fresh token) and a rebuilt response (so the
          // browser stores it).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() revalidates against the auth server. Calling it is also
  // what triggers the token refresh — do not remove it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/studio/login";

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio/login";
    // Remember where they were headed so login can return them there.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Scoped to /studio only — the public site must stay statically
  // prerendered, and running auth middleware over it would opt every
  // page out of that.
  matcher: ["/studio/:path*"],
};
