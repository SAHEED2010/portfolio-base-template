"use client";

import { useActionState, useState } from "react";
import {
  Field,
  FormError,
  FormFooter,
  fieldClass,
} from "@/components/studio/form-field";
import { useUnsavedChanges } from "@/components/studio/use-unsaved-changes";
import type { Stat } from "@/lib/content";
import type { FormState } from "@/lib/form-helpers";

const initialState: FormState = { status: "idle" };

export function StatForm({
  stat,
  action,
}: {
  stat?: Stat;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);

  return (
    <form
      action={formAction}
      onSubmit={() => setDirty(false)}
      onChange={() => setDirty(true)}
      className="flex max-w-2xl flex-col gap-6"
      noValidate
    >
      {stat && <input type="hidden" name="id" value={stat.id} />}

      <Field
        id="number"
        label="Value"
        // type="text", not number: the column is free text on purpose.
        hint='Anything you like — "50+", "10 yrs", "$2M".'
        errors={state.fieldErrors?.number}
      >
        <input
          id="number"
          name="number"
          type="text"
          defaultValue={stat?.number ?? ""}
          required
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <Field
        id="label"
        label="Label"
        hint="What the number refers to."
        errors={state.fieldErrors?.label}
      >
        <input
          id="label"
          name="label"
          type="text"
          defaultValue={stat?.label ?? ""}
          required
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <FormError message={state.message} />
      <FormFooter cancelHref="/studio/stats" />
    </form>
  );
}
