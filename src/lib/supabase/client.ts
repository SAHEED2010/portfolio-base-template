import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Used only where the studio genuinely
// needs client-side auth state — sign-out, and later the image
// uploader, which streams a compressed file straight to Storage
// rather than routing it through a server action.
//
// Anon key only, same as everywhere else.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
