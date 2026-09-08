import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StudioNav } from "./studio-nav";

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s · Studio" },
  robots: { index: false, follow: false },
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The login page renders through this layout too, so it must be
  // able to render without a user — bail out to plain children rather
  // than showing a signed-out chrome.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[100svh] flex-col bg-neutral-100 lg:flex-row">
      <StudioNav email={user.email ?? ""} />
      <main className="min-w-0 flex-1 bg-neutral-50">{children}</main>
    </div>
  );
}
