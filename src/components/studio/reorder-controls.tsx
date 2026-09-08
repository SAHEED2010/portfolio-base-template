"use client";

import { useFormStatus } from "react-dom";

// REUSABLE — used by works, experiences, skills, testimonials, stats.
//
// Up/down buttons rather than drag-and-drop: no dependency, no
// touch-drag quirks, and unambiguous. Drag wins with 20+ items; these
// lists are a handful.
//
// Each button is its own tiny form posting to a server action, so
// reordering works with JavaScript disabled and needs no client state.

function MoveButton({
  direction,
  disabled,
  label,
}: {
  direction: "up" | "down";
  disabled: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-label={label}
      title={label}
      className="tap flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-neutral-400 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
    >
      <span aria-hidden>{direction === "up" ? "↑" : "↓"}</span>
    </button>
  );
}

export function ReorderControls({
  id,
  isFirst,
  isLast,
  action,
}: {
  id: string;
  isFirst: boolean;
  isLast: boolean;
  /** Server action taking FormData with `id` and `direction`. */
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="up" />
        <MoveButton direction="up" disabled={isFirst} label="Move up" />
      </form>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="down" />
        <MoveButton direction="down" disabled={isLast} label="Move down" />
      </form>
    </div>
  );
}
