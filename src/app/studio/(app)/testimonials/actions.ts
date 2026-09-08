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

const TestimonialSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  quote: z.string().trim().min(1, { error: "Quote is required." }),
  avatar_url: z.preprocess(
    emptyToNull,
    z.url({ error: "Invalid image URL." }).nullable(),
  ),
  // Nullable on purpose — a text-only pull quote carries no stars, and
  // the public site renders no dots when this is null (SCHEMA.md).
  // coerce because a number input still posts a string.
  rating: z.preprocess(
    emptyToNull,
    z.coerce
      .number({ error: "Rating must be a number." })
      .int({ error: "Rating must be a whole number." })
      .min(1, { error: "Rating must be between 1 and 5." })
      .max(5, { error: "Rating must be between 1 and 5." })
      .nullable(),
  ),
});

const read = (formData: FormData) => ({
  name: formData.get("name"),
  quote: formData.get("quote"),
  avatar_url: formData.get("avatar_url"),
  rating: formData.get("rating"),
});

export async function createTestimonial(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const parsed = TestimonialSchema.safeParse(read(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);

  const display_order = await nextDisplayOrder(supabase, "testimonials");
  const { error } = await supabase
    .from("testimonials")
    .insert({ ...parsed.data, display_order });
  if (error) return { status: "error", message: error.message };

  revalidatePath("/studio/testimonials");
  revalidatePath("/");
  redirect("/studio/testimonials");
}

export async function updateTestimonial(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing record id." };

  const parsed = TestimonialSchema.safeParse(read(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);

  const { data: existing } = await supabase
    .from("testimonials")
    .select("avatar_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("testimonials")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  if (existing?.avatar_url && existing.avatar_url !== parsed.data.avatar_url) {
    await removeObjectByUrl(supabase, existing.avatar_url);
  }

  revalidatePath("/studio/testimonials");
  revalidatePath("/");
  redirect("/studio/testimonials");
}

export async function deleteTestimonial(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: existing } = await supabase
    .from("testimonials")
    .select("avatar_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (existing?.avatar_url) {
    await removeObjectByUrl(supabase, existing.avatar_url);
  }

  revalidatePath("/studio/testimonials");
  revalidatePath("/");
}

export async function moveTestimonial(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await moveRow(
    supabase,
    "testimonials",
    id,
    formData.get("direction") === "up" ? "up" : "down",
  );
  revalidatePath("/studio/testimonials");
  revalidatePath("/");
}
