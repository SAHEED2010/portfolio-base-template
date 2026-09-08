"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

// Shared form furniture for every studio screen. Lifted out of
// work-form.tsx once there was a second screen, so the markup is
// written once rather than six times.
//
// Keep using these even on the trivial tables (skills, stats). A
// hand-rolled input on the "simple" screen is how six screens stop
// looking like one product.

export const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_4px_rgba(46,110,104,0.12)] focus:outline-none";

export function Field({
  id,
  label,
  hint,
  errors,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-muted">
        {label}
      </label>
      {children}
      {/* Hint gives way to the error rather than stacking, so the
          field never shows contradictory guidance. */}
      {hint && !errors?.length && (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
      {errors?.length ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

// Its own component because useFormStatus only reports the pending
// state of a form it is rendered INSIDE.
export function SaveButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tap inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-7 text-sm font-medium text-neutral-50 transition-colors duration-200 hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function FormFooter({
  cancelHref,
  saveLabel,
}: {
  cancelHref: string;
  saveLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <SaveButton label={saveLabel} />
      <Link
        href={cancelHref}
        className="tap inline-flex min-h-11 items-center rounded-full px-5 text-sm text-muted transition-colors hover:text-ink"
      >
        Cancel
      </Link>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p aria-live="polite" className="text-sm text-red-700">
      {message}
    </p>
  );
}
