"use client";

import { useActionState, useState } from "react";
import {
  Field,
  FormError,
  FormFooter,
  fieldClass,
} from "@/components/studio/form-field";
import { useUnsavedChanges } from "@/components/studio/use-unsaved-changes";
import type { Skill } from "@/lib/content";
import type { FormState } from "@/lib/form-helpers";

const initialState: FormState = { status: "idle" };

export function SkillForm({
  skill,
  action,
}: {
  skill?: Skill;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);

  // One field, but the same structure as every other screen —
  // deliberately not hand-rolled just because it's small.
  return (
    <form
      action={formAction}
      onSubmit={() => setDirty(false)}
      onChange={() => setDirty(true)}
      className="flex max-w-2xl flex-col gap-6"
      noValidate
    >
      {skill && <input type="hidden" name="id" value={skill.id} />}

      <Field
        id="name"
        label="Skill"
        hint="Shown as a numbered list on your site."
        errors={state.fieldErrors?.name}
      >
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={skill?.name ?? ""}
          required
          className={`mt-2 ${fieldClass}`}
        />
      </Field>

      <FormError message={state.message} />
      <FormFooter cancelHref="/studio/skills" />
    </form>
  );
}
