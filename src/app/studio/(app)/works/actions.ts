"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  emptyToNull,
  removeObjectByUrl,
  toFieldErrors,
  type FormState,
} from "@/lib/form-helpers";
import { moveRow, nextDisplayOrder } from "@/lib/reorder";
import { requireUser } from "@/lib/supabase/server";

// Zod v4: top-level formats (z.url), `error` for messages.
const WorkSchema = z.object({
  title: z.string().trim().min(1, { error: "Title is required." }),
  subtitle: z.preprocess(emptyToNull, z.string().trim().nullable()),
  image_url: z.preprocess(emptyToNull, z.url({ error: "Invalid image URL." }).nullable()),
  external_url: z.url({
    error: "Enter a full URL, including https://",
  }),
});

export type WorkFormState = FormState;

function readForm(formData: FormData) {
  return {
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    image_url: formData.get("image_url"),
    external_url: formData.get("external_url"),
  };
}

export async function createWork(
  _prev: WorkFormState,
  formData: FormData,
): Promise<WorkFormState> {
  // Re-checked here, not just in middleware: a server action is a
  // POST endpoint that can be called directly.
  const { supabase } = await requireUser();

  const parsed = WorkSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return toFieldErrors(parsed.error);
  }

  const display_order = await nextDisplayOrder(supabase, "works");
  const { error } = await supabase
    .from("works")
    .insert({ ...parsed.data, display_order });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/studio/works");
  revalidatePath("/");
  redirect("/studio/works");
}

export async function updateWork(
  _prev: WorkFormState,
  formData: FormData,
): Promise<WorkFormState> {
  const { supabase } = await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing record id." };

  const parsed = WorkSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return toFieldErrors(parsed.error);
  }

  // If the image changed, the old object is now unreferenced. Clean
  // it up here rather than leaving it in the bucket forever.
  const { data: existing } = await supabase
    .from("works")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("works")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { status: "error", message: error.message };
  }

  if (existing?.image_url && existing.image_url !== parsed.data.image_url) {
    await removeObjectByUrl(supabase, existing.image_url);
  }

  revalidatePath("/studio/works");
  revalidatePath("/");
  redirect("/studio/works");
}

export async function deleteWork(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: existing } = await supabase
    .from("works")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // Row is gone, so its image is unreferenced.
  if (existing?.image_url) {
    await removeObjectByUrl(supabase, existing.image_url);
  }

  revalidatePath("/studio/works");
  revalidatePath("/");
}

export async function moveWork(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction") === "up" ? "up" : "down";
  if (!id) return;

  await moveRow(supabase, "works", id, direction);

  revalidatePath("/studio/works");
  revalidatePath("/");
}

