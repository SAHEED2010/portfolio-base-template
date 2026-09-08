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
import type { Work } from "@/lib/content";
import type { FormState } from "@/lib/form-helpers";

// Works-specific: the field list and labels. Everything structural
// comes from components/studio.

const initialState: FormState = { status: "idle" };

export function WorkForm({
  work,
  action,
}: {
  work?: Work;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [imageUrl, setImageUrl] = useState<string | null>(
    work?.image_url ?? null,
  );
  const [dirty, setDirty] = useState(false);

  useUnsavedChanges(dirty);
  const errors = state.fieldErrors;

  return (
    <form
      // formAction MUST be passed directly. Wrapping it makes the form
      // a CLIENT action — React then renders action="javascript:throw"
      // and the submit never reaches the server. Guarded by
      // scripts/studio-smoke-test.mjs.
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

      <FormError message={state.message} />
      <FormFooter cancelHref="/studio/works" />
    </form>
  );
}
