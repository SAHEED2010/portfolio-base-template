"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "./auth-actions";

// Studio navigation.
//
// Desktop-first by design — the inverse of the public site. Visitors
// are on phones; the client doing bulk content entry is at a desk. But
// nothing here may be desktop-only: "fix a typo from my phone" has to
// work, so the sidebar becomes a disclosure panel below lg rather
// than disappearing.

export type StudioNavItem = { href: string; label: string };

export const STUDIO_NAV: StudioNavItem[] = [
  { href: "/studio", label: "Overview" },
  { href: "/studio/settings", label: "Site content" },
  { href: "/studio/works", label: "Works" },
  { href: "/studio/experiences", label: "Experience" },
  { href: "/studio/skills", label: "Skills" },
  { href: "/studio/testimonials", label: "Testimonials" },
  { href: "/studio/stats", label: "Stats" },
  { href: "/studio/inbox", label: "Inbox" },
];

function isActive(pathname: string, href: string) {
  // Exact match for the index, prefix match for sections — so
  // /studio/works/abc still highlights Works.
  return href === "/studio" ? pathname === href : pathname.startsWith(href);
}

export function StudioNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <ul className="flex flex-col gap-0.5">
      {STUDIO_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors duration-150",
                active
                  ? "bg-neutral-200/60 font-medium text-primary"
                  : "text-neutral-600 hover:bg-neutral-200/40 hover:text-primary",
              ].join(" ")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile: a disclosure bar above the content. */}
      <div className="border-b border-neutral-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex min-h-11 items-center gap-2.5 pr-2 text-sm"
          >
            <span
              aria-hidden
              className={`h-px bg-accent transition-all duration-300 ${open ? "w-3" : "w-6"}`}
            />
            <span className="text-xs uppercase tracking-[0.22em] text-primary">
              {open ? "Close" : "Menu"}
            </span>
          </button>

          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-11 items-center text-sm text-neutral-500 transition-colors hover:text-accent"
            >
              Sign out
            </button>
          </form>
        </div>

        {open && <nav className="px-3 pb-4">{links}</nav>}
      </div>

      {/* Desktop: persistent sidebar. */}
      <aside className="hidden w-60 shrink-0 border-r border-neutral-200 lg:flex lg:flex-col lg:justify-between">
        <div className="p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <span aria-hidden className="h-px w-6 bg-accent" />
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Studio
            </p>
          </div>
          <nav className="mt-4">{links}</nav>
        </div>

        <div className="border-t border-neutral-200 p-4">
          <p className="truncate px-3 text-xs text-neutral-500" title={email}>
            {email}
          </p>
          <form action={signOut} className="mt-1">
            <button
              type="submit"
              className="flex min-h-11 w-full items-center rounded-lg px-3 text-sm text-neutral-600 transition-colors hover:bg-neutral-200/40 hover:text-primary"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
