"use client";

import { useActionState, useState } from "react";
import {
  Field,
  FormError,
  FormFooter,
  fieldClass,
} from "@/components/studio/form-field";
import { ImageUpload } from "@/components/studio/image-upload";
import { ListObjectField } from "@/components/studio/list-object-field";
import { ListStringField } from "@/components/studio/list-string-field";
import { useUnsavedChanges } from "@/components/studio/use-unsaved-changes";
import type { FormState } from "@/lib/form-helpers";
import type { SettingGroupDef } from "@/lib/studio/settings-fields";
import type { SettingsMap } from "@/lib/settings";

const initialState: FormState = { status: "idle" };

export function SettingsGroupForm({
  group,
  settings,
  action,
}: {
  group: SettingGroupDef;
  settings: SettingsMap;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  const markDirty = () => setDirty(true);

  return (
    <form
      // formAction MUST be passed directly — wrapping it turns the
      // form into a client action and the submit never reaches the
      // server. See DECISIONS.md / the studio smoke test.
      action={formAction}
      onSubmit={() => setDirty(false)}
      onChange={markDirty}
      className="flex max-w-2xl flex-col gap-6"
      noValidate
    >
      {group.fields.map((field) => {
        const errors = state.fieldErrors?.[field.key];
        const raw = settings[field.key];

        if (field.type === "list-string") {
          const value = Array.isArray(raw) ? (raw as string[]) : [];
          return (
            <div key={field.key}>
              <span className="block text-sm text-neutral-600">
                {field.label}
              </span>
              {field.hint && (
                <p className="mt-1 text-xs text-neutral-500">{field.hint}</p>
              )}
              <div className="mt-2">
                <ListStringField
                  name={field.key}
                  value={value}
                  itemLabel={field.itemLabel}
                  onDirty={markDirty}
                />
              </div>
            </div>
          );
        }

        if (field.type === "list-object" && field.itemFields) {
          const value = Array.isArray(raw)
            ? (raw as Record<string, unknown>[])
            : [];
          return (
            <div key={field.key}>
              <span className="block text-sm text-neutral-600">
                {field.label}
              </span>
              {field.hint && (
                <p className="mt-1 text-xs text-neutral-500">{field.hint}</p>
              )}
              <div className="mt-2">
                <ListObjectField
                  name={field.key}
                  value={value}
                  fields={field.itemFields}
                  itemLabel={field.itemLabel}
                  onDirty={markDirty}
                />
              </div>
            </div>
          );
        }

        if (field.type === "image") {
          return (
            <ImageSettingField
              key={field.key}
              name={field.key}
              label={field.label}
              folder={field.folder ?? "settings"}
              initial={typeof raw === "string" ? raw : ""}
              hint={field.hint}
              onDirty={markDirty}
            />
          );
        }

        const stringValue = typeof raw === "string" ? raw : "";

        return (
          <Field
            key={field.key}
            id={field.key}
            label={field.label}
            hint={field.hint}
            errors={errors}
          >
            {field.type === "textarea" ? (
              <textarea
                id={field.key}
                name={field.key}
                rows={4}
                defaultValue={stringValue}
                required={field.required}
                className={`mt-2 resize-y ${fieldClass}`}
              />
            ) : (
              <input
                id={field.key}
                name={field.key}
                type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                defaultValue={stringValue}
                required={field.required}
                className={`mt-2 ${fieldClass}`}
              />
            )}
          </Field>
        );
      })}

      <FormError message={state.message} />
      <FormFooter cancelHref="/studio/settings" />
    </form>
  );
}

// A real component, not an inline hook call inside .map() — a hook
// can't be called conditionally/per-iteration from within a callback,
// even when the iteration count is stable in practice. ImageUpload is
// controlled, so each image field needs its own bit of local state.
function ImageSettingField({
  name,
  label,
  folder,
  initial,
  hint,
  onDirty,
}: {
  name: string;
  label: string;
  folder: string;
  initial: string;
  hint?: string;
  onDirty: () => void;
}) {
  const [url, setUrl] = useState<string | null>(initial);
  return (
    <ImageUpload
      name={name}
      label={label}
      folder={folder}
      value={url}
      onChange={(next) => {
        setUrl(next);
        onDirty();
      }}
      hint={hint}
    />
  );
}
