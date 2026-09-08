"use client";

import { useActionState, useState } from "react";
import {
  Field,
  FormError,
  FormFooter,
  fieldClass,
} from "@/components/studio/form-field";
import { ImageUpload } from "@/components/studio/image-upload";
import { useUnsavedChanges } from "@/components/studio/use-unsaved-changes";
import type { Experience } from "@/lib/content";
import type { FormState } from "@/lib/form-helpers";

const initialState: FormState = { status: "idle" };

export function ExperienceForm({
  experience,
  action,
}: {
  experience?: Experience;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    experience?.logo_url ?? null,
  );
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);

  const errors = state.fieldErrors;

  return (
    <form
      action={formAction}
      onSubmit={() => setDirty(false)}
      onChange={() => setDirty(true)}
      className="flex max-w-2xl flex-col gap-6"
      noValidate
    >
      {experience && <input type="hidden" name="id" value={experience.id} />}

      <Field id="title" label="Role" errors={errors?.title}>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={experience?.title ?? ""}
          required
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <Field id="org" label="Organisation" errors={errors?.org}>
        <input
          id="org"
          name="org"
          type="text"
          defaultValue={experience?.org ?? ""}
          required
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="start_date" label="Start date" errors={errors?.start_date}>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={experience?.start_date ?? ""}
            required
            className={`mt-2 ${fieldClass}`}
          />
        </Field>

        <Field
          id="end_date"
          label="End date"
          hint="Leave blank if this is current."
          errors={errors?.end_date}
        >
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={experience?.end_date ?? ""}
            className={`mt-2 ${fieldClass}`}
          />
        </Field>
      </div>

      <Field
        id="type"
        label="Type"
        // Free text by design — no fixed set is known across
        // professions yet, so this must not become a dropdown until
        // real client data says what the options are (DECISIONS.md).
        hint="Optional, e.g. work, education, volunteer."
        errors={errors?.type}
      >
        <input
          id="type"
          name="type"
          type="text"
          defaultValue={experience?.type ?? ""}
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <Field
        id="description"
        label="Description"
        hint="Optional. A sentence or two about the work."
        errors={errors?.description}
      >
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={experience?.description ?? ""}
          className={`mt-2 resize-y ${fieldClass}`}
        />
      </Field>

      <ImageUpload
        name="logo_url"
        label="Logo"
        folder="experiences"
        aspect="aspect-square"
        value={logoUrl}
        onChange={(url) => {
          setLogoUrl(url);
          setDirty(true);
        }}
        hint="Optional. Shown as a small mark beside the organisation."
      />

      <FormError message={state.message} />
      <FormFooter cancelHref="/studio/experiences" />
    </form>
  );
}
