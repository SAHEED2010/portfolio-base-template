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

// A <input type="date"> posts "YYYY-MM-DD", which is what the date
// column wants — so this validates the shape rather than parsing to a
// Date and formatting back, which would reintroduce the timezone bug
// lib/format.ts already avoids.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Use a valid date." });

const ExperienceSchema = z
  .object({
    title: z.string().trim().min(1, { error: "Title is required." }),
    org: z.string().trim().min(1, { error: "Organisation is required." }),
    start_date: isoDate,
    // Null means "Present" on the public site (SCHEMA.md).
    end_date: z.preprocess(emptyToNull, isoDate.nullable()),
    type: z.preprocess(emptyToNull, z.string().trim().nullable()),
    description: z.preprocess(emptyToNull, z.string().trim().nullable()),
    logo_url: z.preprocess(
      emptyToNull,
      z.url({ error: "Invalid image URL." }).nullable(),
    ),
  })
  // Cross-field check: a role can't end before it started. Zod v4
  // still uses .refine for this; `path` puts the message on the field
  // the user can actually fix.
  .refine(
    (value) => !value.end_date || value.end_date >= value.start_date,
    { error: "End date must be after the start date.", path: ["end_date"] },
  );

const read = (formData: FormData) => ({
  title: formData.get("title"),
  org: formData.get("org"),
  start_date: formData.get("start_date"),
  end_date: formData.get("end_date"),
  type: formData.get("type"),
  description: formData.get("description"),
  logo_url: formData.get("logo_url"),
});

export async function createExperience(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const parsed = ExperienceSchema.safeParse(read(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);

  const display_order = await nextDisplayOrder(supabase, "experiences");
  const { error } = await supabase
    .from("experiences")
    .insert({ ...parsed.data, display_order });
  if (error) return { status: "error", message: error.message };

  revalidatePath("/studio/experiences");
  revalidatePath("/");
  redirect("/studio/experiences");
}

export async function updateExperience(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing record id." };

  const parsed = ExperienceSchema.safeParse(read(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);

  const { data: existing } = await supabase
    .from("experiences")
    .select("logo_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("experiences")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  if (existing?.logo_url && existing.logo_url !== parsed.data.logo_url) {
    await removeObjectByUrl(supabase, existing.logo_url);
  }

  revalidatePath("/studio/experiences");
  revalidatePath("/");
  redirect("/studio/experiences");
}

export async function deleteExperience(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: existing } = await supabase
    .from("experiences")
    .select("logo_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (existing?.logo_url) {
    await removeObjectByUrl(supabase, existing.logo_url);
  }

  revalidatePath("/studio/experiences");
  revalidatePath("/");
}

export async function moveExperience(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await moveRow(
    supabase,
    "experiences",
    id,
    formData.get("direction") === "up" ? "up" : "down",
  );
  revalidatePath("/studio/experiences");
  revalidatePath("/");
}
