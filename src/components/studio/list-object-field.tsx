"use client";

import { useState } from "react";
import { fieldClass } from "./form-field";
import type { ListObjectFieldDef } from "@/lib/studio/settings-fields";

// Editor for a jsonb array of objects — contact_channels, social_links.
// Same submission strategy as ListStringField: indexed hidden inputs,
// `${name}.${index}.${fieldName}`, reconstructed server-side.

export function ListObjectField({
  name,
  value,
  fields,
  itemLabel = "Add item",
  onDirty,
}: {
  name: string;
  value: Record<string, unknown>[];
  fields: ListObjectFieldDef[];
  itemLabel?: string;
  onDirty: () => void;
}) {
  const [items, setItems] = useState<Record<string, unknown>[]>(
    value.length ? value : [],
  );

  const update = (next: Record<string, unknown>[]) => {
    setItems(next);
    onDirty();
  };

  const updateField = (
    index: number,
    fieldName: string,
    fieldValue: unknown,
  ) => {
    const next = [...items];
    next[index] = { ...next[index], [fieldName]: fieldValue };
    update(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-xl border border-border p-4"
        >
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs text-muted">
                {field.label}
              </label>
              {field.type === "checkbox" ? (
                <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    name={`${name}.${i}.${field.name}`}
                    checked={Boolean(item[field.name])}
                    onChange={(e) =>
                      updateField(i, field.name, e.target.checked)
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  Use as the primary button
                </label>
              ) : (
                <input
                  type={field.type === "url" ? "url" : "text"}
                  name={`${name}.${i}.${field.name}`}
                  value={String(item[field.name] ?? "")}
                  onChange={(e) => updateField(i, field.name, e.target.value)}
                  className={`mt-1.5 ${fieldClass}`}
                />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => update(items.filter((_, idx) => idx !== i))}
            className="tap self-start text-sm text-muted transition-colors hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <input type="hidden" name={`${name}.__empty`} value="1" />
      )}

      <button
        type="button"
        onClick={() =>
          update([
            ...items,
            Object.fromEntries(fields.map((f) => [f.name, f.type === "checkbox" ? false : ""])),
          ])
        }
        className="tap inline-flex min-h-11 w-fit items-center rounded-full border border-border px-5 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:text-ink"
      >
        {itemLabel}
      </button>
    </div>
  );
}
