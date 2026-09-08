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
import type { Testimonial } from "@/lib/content";
import type { FormState } from "@/lib/form-helpers";

const initialState: FormState = { status: "idle" };

export function TestimonialForm({
  testimonial,
  action,
}: {
  testimonial?: Testimonial;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    testimonial?.avatar_url ?? null,
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
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}

      <Field id="name" label="Name" errors={errors?.name}>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={testimonial?.name ?? ""}
          required
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <Field id="quote" label="Quote" errors={errors?.quote}>
        <textarea
          id="quote"
          name="quote"
          rows={4}
          defaultValue={testimonial?.quote ?? ""}
          required
          className={`mt-2 resize-y ${fieldClass}`}
        />
      </Field>

      <Field
        id="rating"
        label="Rating"
        hint="Optional, 1–5. Leave blank for a quote with no rating."
        errors={errors?.rating}
      >
        <input
          id="rating"
          name="rating"
          type="number"
          min={1}
          max={5}
          step={1}
          inputMode="numeric"
          defaultValue={testimonial?.rating ?? ""}
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      {/* Second use of the shared uploader — only folder and aspect
          differ from works. */}
      <ImageUpload
        name="avatar_url"
        label="Photo"
        folder="testimonials"
        aspect="aspect-square"
        value={avatarUrl}
        onChange={(url) => {
          setAvatarUrl(url);
          setDirty(true);
        }}
        hint="Optional. Without one, their initials are shown."
      />

      <FormError message={state.message} />
      <FormFooter cancelHref="/studio/testimonials" />
    </form>
  );
}
