import Link from "next/link";

// Shared chrome for every studio list screen: the accent rule and
// eyebrow from the public site, a heading, an optional description,
// and the primary "Add …" action.

export function StudioPageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-accent" />
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {eyebrow}
          </p>
        </div>
        <h1 className="font-display mt-5 text-3xl tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-base text-muted">
            {description}
          </p>
        )}
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="tap inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-neutral-50 transition-colors hover:bg-accent-hover"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

// Shown when a table has no rows. Says what the consequence is on the
// public site — an empty table hides that whole section, and a client
// should be told that rather than wondering where it went.
export function StudioEmptyState({
  title,
  consequence,
}: {
  title: string;
  consequence: string;
}) {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-neutral-300 p-10 text-center">
      <p className="text-base text-muted">{title}</p>
      <p className="mt-1 text-sm text-muted">{consequence}</p>
    </div>
  );
}

export function StudioPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      {children}
    </div>
  );
}
