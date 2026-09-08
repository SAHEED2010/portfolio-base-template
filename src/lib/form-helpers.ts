import { z } from "zod";
import { pathFromPublicUrl, MEDIA_BUCKET } from "./storage";
import type { createClient } from "./supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Shared across every studio table's actions, so validation and
// cleanup behave identically on all six screens.

/**
 * An untouched optional input posts "" rather than being absent, so
 * blanks are normalised to null BEFORE validation rather than failing
 * it. Zod v4: use with z.preprocess.
 */
export const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

/** Standard shape returned by every studio form action. */
export type FormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Zod v4: flattenError, not the removed .flatten(). */
export function toFieldErrors(error: z.ZodError): FormState {
  return { status: "error", fieldErrors: z.flattenError(error).fieldErrors };
}

/**
 * Deletes a storage object that a row no longer references.
 *
 * Best effort by design: a failed cleanup logs and never fails the
 * user's save. A leaked object is annoying; a broken edit is worse.
 * A URL that isn't ours parses to null and is never touched.
 */
export async function removeObjectByUrl(
  supabase: SupabaseClient,
  url: string | null,
): Promise<void> {
  const path = pathFromPublicUrl(url);
  if (!path) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) {
    console.warn("[storage] orphaned object", path, error.message);
  }
}
