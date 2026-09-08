"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImageUpload } from "@/components/studio/image-upload";
import { useUnsavedChanges } from "@/components/studio/use-unsaved-changes";
import type { Work } from "@/lib/content";
import type { WorkFormState } from "./actions";

// Works-specific: the field list and labels.
// Everything structural — ImageUpload, useUnsavedChanges, the field
// and error markup — is shared and gets reused by the other six.

const initialState: WorkFormState = { status: "idle" };

const fieldClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base text-primary transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_4px_rgba(46,110,104,0.12)] focus:outline-none";

function Field({
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
      <label htmlFor={id} className="block text-sm text-neutral-600">
        {label}
      </label>
      {children}
      {hint && !errors?.length && (
        <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      )}
      {errors?.length ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tap inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-7 text-sm font-medium text-neutral-50 transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function WorkForm({
  work,
  action,
}: {
  work?: Work;
  action: (
    state: WorkFormState,
    formData: FormData,
  ) => Promise<WorkFormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [imageUrl, setImageUrl] = useState<string | null>(
    work?.image_url ?? null,
  );
  const [dirty, setDirty] = useState(false);

  // Explicit save, so the guard has something to protect. Submitting
  // clears it — otherwise the redirect after a successful save would
  // trip the warning on the way out.
  useUnsavedChanges(dirty);

  const errors = state.fieldErrors;

  return (
    <form
      // formAction MUST be passed directly. Wrapping it in an arrow
      // function turns the form into a CLIENT action: React then
      // renders action="javascript:throw new Error('React form
      // unexpectedly submitted.')" instead of the real server-action
      // wiring, and the submit never reaches the server. That was the
      // loop-2 bug — updateWork was never invoked once.
      //
      // Resetting `dirty` happens in onSubmit, which fires before the
      // action runs and does not disturb the wiring.
      action={formAction}
      onSubmit={() => setDirty(false)}
      onChange={() => setDirty(true)}
      className="flex max-w-2xl flex-col gap-6"
      noValidate
    >
      {work && <input type="hidden" name="id" value={work.id} />}

      <Field id="title" label="Title" errors={errors?.title}>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={work?.title ?? ""}
          required
          aria-describedby={errors?.title ? "title-error" : undefined}
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <Field
        id="subtitle"
        label="Subtitle"
        hint="Optional. One line describing the project."
        errors={errors?.subtitle}
      >
        <input
          id="subtitle"
          name="subtitle"
          type="text"
          defaultValue={work?.subtitle ?? ""}
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <Field
        id="external_url"
        label="Link"
        hint="Where this work card sends visitors."
        errors={errors?.external_url}
      >
        <input
          id="external_url"
          name="external_url"
          type="url"
          inputMode="url"
          defaultValue={work?.external_url ?? ""}
          placeholder="https://"
          required
          aria-describedby={
            errors?.external_url ? "external_url-error" : undefined
          }
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <ImageUpload
        name="image_url"
        label="Image"
        folder="works"
        aspect="aspect-[4/3]"
        value={imageUrl}
        onChange={(url) => {
          setImageUrl(url);
          setDirty(true);
        }}
        hint="Shown on the work card. Without one, the card shows a lettermark."
      />

      {state.status === "error" && state.message && (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SaveButton />
        <Link
          href="/studio/works"
          className="tap inline-flex min-h-11 items-center rounded-full px-5 text-sm text-neutral-600 transition-colors hover:text-primary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
