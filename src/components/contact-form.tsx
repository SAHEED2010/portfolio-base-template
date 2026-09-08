"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitContactMessage,
  type ContactFormState,
} from "@/app/actions";

// Client island for the contact form. useActionState (React 19) wires
// a server action to form state without an API route or manual fetch;
// useFormStatus reads the pending state of the enclosing form, which
// is why Submit is its own component — the hook only sees a form from
// inside it.

const initialState: ContactFormState = { status: "idle" };

// Focus grows a soft accent ring rather than snapping a border on —
// the field visibly receives focus, which matters most on mobile
// where the keyboard covers half the screen.
const fieldClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base text-primary shadow-[0_0_0_0_rgba(46,110,104,0)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-neutral-400 focus:border-accent focus:shadow-[0_0_0_4px_rgba(46,110,104,0.12)] focus:outline-none";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      // min-h-[44px] is the touch-target floor; py-3.5 already clears
      // it, but the constraint is explicit so restyling can't break it.
      className="tap inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-neutral-50 transition-colors duration-200 hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Sending…" : label}
    </button>
  );
}

export function ContactForm({ submitLabel }: { submitLabel: string }) {
  const [state, formAction] = useActionState(
    submitContactMessage,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div
        // Announced rather than silently swapped, so a screen reader
        // knows the message actually sent.
        aria-live="polite"
        className="rounded-2xl border border-accent/20 bg-accent/5 p-8"
      >
        <p className="font-display text-2xl text-primary">Message sent</p>
        <p className="mt-2 text-base text-neutral-600">
          Thanks for reaching out — you&apos;ll get a reply within a couple of
          days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div>
        {/* Visible labels, not placeholder-only: placeholders vanish
            on focus and fail screen readers. */}
        <label htmlFor="name" className="block text-sm text-neutral-600">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          className={`mt-2 ${fieldClass}`}
        />
        {state.fieldErrors?.name && (
          <p id="name-error" className="mt-1.5 text-sm text-red-700">
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-neutral-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          // inputMode gives phones the @-bearing keyboard.
          inputMode="email"
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
          className={`mt-2 ${fieldClass}`}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1.5 text-sm text-red-700">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-neutral-600">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-describedby={
            state.fieldErrors?.message ? "message-error" : undefined
          }
          className={`mt-2 resize-y ${fieldClass}`}
        />
        {state.fieldErrors?.message && (
          <p id="message-error" className="mt-1.5 text-sm text-red-700">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      {state.status === "error" && state.message && (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="mt-1">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
