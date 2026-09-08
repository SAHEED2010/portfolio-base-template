import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Studio overview. Counts come through the USER'S session, so what's
// shown here is exactly what RLS permits them to see — the inbox
// count in particular proves the authenticated read path works.

const TABLES = [
  { table: "works", label: "Works", href: "/studio/works" },
  { table: "experiences", label: "Experience", href: "/studio/experiences" },
  { table: "skills", label: "Skills", href: "/studio/skills" },
  { table: "testimonials", label: "Testimonials", href: "/studio/testimonials" },
  { table: "stats", label: "Stats", href: "/studio/stats" },
] as const;

export default async function StudioOverview() {
  const supabase = await createClient();

  const counts = await Promise.all(
    TABLES.map(async (entry) => {
      // head: true fetches no rows — just the count. Cheaper than
      // pulling every row to call .length on it.
      const { count } = await supabase
        .from(entry.table)
        .select("*", { count: "exact", head: true });
      return { ...entry, count: count ?? 0 };
    }),
  );

  const { count: unread } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px w-8 bg-accent" />
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Overview
        </p>
      </div>

      <h1 className="font-display mt-5 text-3xl tracking-tight text-ink">
        Your site
      </h1>
      <p className="mt-2 max-w-xl text-base text-muted">
        Everything visitors see is edited here. Changes appear on the live
        site within a minute.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/studio/settings"
          className="tap inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-neutral-50 transition-colors hover:bg-accent-hover"
        >
          Edit site content
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="tap inline-flex min-h-11 items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-ink"
        >
          View live site ↗
        </a>
      </div>

      {unread !== null && unread > 0 && (
        <Link
          href="/studio/inbox"
          className="mt-8 flex items-center justify-between rounded-xl border border-accent/25 bg-accent/5 px-5 py-4 transition-colors hover:border-accent/40"
        >
          <span className="text-sm text-ink">
            {unread} unread {unread === 1 ? "message" : "messages"}
          </span>
          <span aria-hidden className="text-accent">
            →
          </span>
        </Link>
      )}

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {counts.map((entry) => (
          <Link
            key={entry.table}
            href={entry.href}
            className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-neutral-300"
          >
            <p className="font-display text-3xl tracking-tight text-ink">
              {entry.count}
            </p>
            <p className="mt-1 text-sm text-muted transition-colors group-hover:text-accent">
              {entry.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
