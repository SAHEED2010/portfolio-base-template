"use client";

import imageCompression from "browser-image-compression";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ACCEPTED_MIME,
  MAX_UPLOAD_BYTES,
  MEDIA_BUCKET,
  objectPathFor,
  pathFromPublicUrl,
} from "@/lib/storage";

// REUSABLE — this is the one image field. Works uses it for
// image_url; experiences.logo_url, testimonials.avatar_url and the
// hero portrait will use the same component with a different
// `folder` and `aspect`. Nothing in here is works-specific.
//
// Uploads happen from the BROWSER, not through a server action: the
// file is compressed client-side, so sending it to our server first
// would mean pushing the bytes twice for no benefit. The browser
// client carries the user's session, so the bucket's
// authenticated-write policy still applies.
//
// The value is the full public URL, which is what the column stores.

type Props = {
  name: string;
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  /** Bucket folder — "works", "experiences", "testimonials", "hero". */
  folder: string;
  /** Tailwind aspect class for the preview box. */
  aspect?: string;
  hint?: string;
};

export function ImageUpload({
  name,
  label,
  value,
  onChange,
  folder,
  aspect = "aspect-[4/3]",
  hint,
}: Props) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Best effort: a failed cleanup must never block the user. Worst
  // case is a leaked object, which beats a broken save.
  async function removeObject(url: string | null) {
    const path = pathFromPublicUrl(url);
    if (!path) return;
    const { error: removeError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([path]);
    if (removeError) {
      console.warn("[upload] could not remove old object", path, removeError);
    }
  }

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED_MIME.includes(file.type)) {
      setError("Use a JPEG, PNG or WebP image.");
      return;
    }

    setBusy(true);
    try {
      // Compress in the browser so we never ship a 12MB phone photo.
      // Vercel has no persistent disk and server-side compression
      // would cost CPU on every upload (DECISIONS.md).
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.8,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        fileType: file.type,
      });

      // Hard reject rather than silently uploading something the
      // bucket will refuse with an opaque 413.
      if (compressed.size > MAX_UPLOAD_BYTES) {
        setError(
          `Still ${(compressed.size / 1024 / 1024).toFixed(1)}MB after compressing. Please use a smaller image.`,
        );
        return;
      }

      const path = objectPathFor(folder, compressed.type || file.type);
      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, compressed, {
          contentType: compressed.type || file.type,
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

      // Replacing: drop the previous object so the bucket doesn't
      // accumulate every version the client ever tried.
      const previous = value;
      onChange(publicUrl);
      await removeObject(previous);
    } catch (caught) {
      console.error("[upload] failed", caught);
      setError("That upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    const previous = value;
    onChange(null);
    await removeObject(previous);
  }

  return (
    <div>
      <span className="block text-sm text-neutral-600">{label}</span>

      {/* The URL travels with the form as a hidden field, so the
          server action reads it like any other input. */}
      <input type="hidden" name={name} value={value ?? ""} />

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={`${aspect} w-full max-w-[12rem] shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs text-neutral-400">No image</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="tap inline-flex min-h-11 items-center rounded-full border border-neutral-200 px-5 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:text-primary disabled:opacity-60"
            >
              {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
            </button>

            {value && !busy && (
              <button
                type="button"
                onClick={handleRemove}
                className="tap inline-flex min-h-11 items-center rounded-full px-4 text-sm text-neutral-500 transition-colors hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-neutral-500">
            {hint ?? "JPEG, PNG or WebP. Large images are compressed automatically."}
          </p>

          {error && (
            <p aria-live="polite" className="text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
