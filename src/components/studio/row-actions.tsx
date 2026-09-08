"use client";

// Delete control for list rows. A component rather than inline markup
// so every table's delete looks and behaves identically — including
// the confirm, which is the difference between a mis-tap and a lost
// testimonial.

export function DeleteButton({
  id,
  label,
  action,
}: {
  id: string;
  /** Used in the confirm prompt and the accessible name. */
  label: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${label}”? This can't be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Delete ${label}`}
        className="tap flex h-9 items-center rounded-lg px-3 text-sm text-muted transition-colors hover:text-red-700"
      >
        Delete
      </button>
    </form>
  );
}
