import type { Metadata } from "next";

// Metadata only — no chrome and no auth check here.
//
// The sidebar lives in (app)/layout.tsx so it wraps the authenticated
// routes ONLY. /studio/login is a sibling of that group, so the sign-in
// page no longer renders inside the signed-in shell.

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s · Studio" },
  // The studio must never be indexed. Obscurity is not the security
  // layer — RLS is — but there's no reason for it to be searchable.
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
