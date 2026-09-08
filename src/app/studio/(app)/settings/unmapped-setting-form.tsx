"use client";

import { useActionState } from "react";
import { Field, FormError, SaveButton, fieldClass } from "@/components/studio/form-field";
import type { FormState } from "@/lib/form-helpers";
import { updateUnmappedSetting } from "./actions";

const initialState: FormState = { status: "idle" };

// Loud-fail rendering for a key not in the field map (see page.tsx).
// A plain text field, not silence.
export function UnmappedSettingForm({
  settingKey,
  value,
}: {
  settingKey: string;
  value: string;
}) {
  const [state, formAction] = useActionState(updateUnmappedSetting, initialState);

  return (
    <form action={formAction} className="flex items-end gap-3" noValidate>
      <input type="hidden" name="key" value={settingKey} />
      <div className="flex-1">
        <Field id={settingKey} label={settingKey} errors={state.fieldErrors?.value}>
          <input
            id={settingKey}
            name="value"
            type="text"
            defaultValue={value}
            className={`mt-2 ${fieldClass}`}
          />
        </Field>
      </div>
      <SaveButton label="Save" />
      <FormError message={state.message} />
    </form>
  );
}
