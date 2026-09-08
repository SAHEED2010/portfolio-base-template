"use client";

import { useState } from "react";
import { fieldClass } from "./form-field";

// Editor for a jsonb array of strings — currently only hero_phrases.
//
// State lives client-side; each row is submitted as an indexed hidden
// input (`${name}.0`, `${name}.1`, …) so the server action can
// reconstruct the array from FormData without a round trip per edit.
// Reordering is local-only (no server call) since it's part of one
// group save, not its own action.

export function ListStringField({
  name,
  value,
  itemLabel = "Add item",
  onDirty,
}: {
  name: string;
  value: string[];
  itemLabel?: string;
  onDirty: () => void;
}) {
  const [items, setItems] = useState<string[]>(value.length ? value : []);

  const update = (next: string[]) => {
    setItems(next);
    onDirty();
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="hidden" name={`${name}.${i}`} value={item} />
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              update(next);
            }}
            className={fieldClass}
          />
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => {
                if (i === 0) return;
                const next = [...items];
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                update(next);
              }}
              disabled={i === 0}
              aria-label="Move up"
              className="tap flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => {
                if (i === items.length - 1) return;
                const next = [...items];
                [next[i], next[i + 1]] = [next[i + 1], next[i]];
                update(next);
              }}
              disabled={i === items.length - 1}
              aria-label="Move down"
              className="tap flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => update(items.filter((_, idx) => idx !== i))}
              aria-label="Remove"
              className="tap flex h-9 items-center rounded-lg px-3 text-sm text-neutral-500 transition-colors hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {/* Marks the field as present-but-empty even with zero rows, so
          the action can tell "cleared to none" apart from "untouched". */}
      {items.length === 0 && <input type="hidden" name={`${name}.__empty`} value="1" />}

      <button
        type="button"
        onClick={() => update([...items, ""])}
        className="tap mt-1 inline-flex min-h-11 w-fit items-center rounded-full border border-neutral-200 px-5 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:text-primary"
      >
        {itemLabel}
      </button>
    </div>
  );
}
