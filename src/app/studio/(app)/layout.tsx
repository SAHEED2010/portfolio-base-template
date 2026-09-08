import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudioNav } from "../studio-nav";

// Chrome for the AUTHENTICATED studio only.
//
// This is a route group — "(app)" doesn't appear in any URL, so
// /studio and /studio/works still resolve here while /studio/login
// sits outside it. Previously the login page rendered inside this
// layout, so a bounced user saw the sidebar and their own email
// wrapped around a "Sign in" form.
//
// Middleware already gate-keeps these routes; this check is the
// belt-and-braces that also guarantees `user` is non-null below.

export default async function StudioAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/studio/login");

  return (
    <div className="flex min-h-[100svh] flex-col bg-neutral-100 lg:flex-row">
      <StudioNav email={user.email ?? ""} />
      <main className="min-w-0 flex-1 bg-neutral-50">{children}</main>
    </div>
  );
}
