"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginState } from "../auth-actions";

const initialState: LoginState = { status: "idle" };

// color-mix() against var(--color-accent), not a hardcoded rgba() —
// see contact-form.tsx for why.
const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_12%,transparent)] focus:outline-none";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tap mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-neutral-50 transition-colors duration-200 hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="block text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className={`mt-2 ${fieldClass}`}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1.5 text-sm text-red-700">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          className={`mt-2 ${fieldClass}`}
        />
        {state.fieldErrors?.password && (
          <p id="password-error" className="mt-1.5 text-sm text-red-700">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {state.status === "error" && state.message && (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
