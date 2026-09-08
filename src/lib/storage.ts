// Storage helpers for the `media` bucket.
//
// STORAGE POLICY (settled, see DECISIONS.md):
//
// Path shape:  <folder>/<uuid>.<ext>   e.g. works/3f2a….webp
//   Random filename, not the original — avoids collisions, avoids
//   leaking the client's local filenames, and sidesteps unicode/
//   spaces in user filenames entirely.
//
// We store the FULL PUBLIC URL in the row (SCHEMA.md), so cleanup
// needs to turn a URL back into a storage path. That's what
// pathFromPublicUrl does, and it's why the URL shape matters.
//
// Lifecycle:
//   replace image  -> old object deleted (best effort)
//   delete row     -> its object deleted (best effort)
//   upload then
//   never save     -> ORPHAN. Accepted V1 gap — see below.
//
// Best-effort means a failed delete never blocks the user's save. A
// leaked object is annoying; a save that fails because cleanup failed
// is worse.

export const MEDIA_BUCKET = "media";

// Mirrors the bucket's own limits (migration 20260908010000). Checked
// client-side so the user gets a real message instead of an opaque
// 413 from the API — the bucket still enforces it regardless.
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];

const PUBLIC_MARKER = `/storage/v1/object/public/${MEDIA_BUCKET}/`;

/**
 * Turns a stored public URL back into the object path inside the
 * bucket. Returns null for anything that isn't one of our URLs — a
 * fork may have pasted an external image URL into the column, and we
 * must never try to delete something we don't own.
 */
export function pathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const index = url.indexOf(PUBLIC_MARKER);
  if (index === -1) return null;
  const path = url.slice(index + PUBLIC_MARKER.length);
  return path.length > 0 ? decodeURIComponent(path) : null;
}

export function extensionFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export function objectPathFor(folder: string, mime: string): string {
  return `${folder}/${crypto.randomUUID()}.${extensionFor(mime)}`;
}
