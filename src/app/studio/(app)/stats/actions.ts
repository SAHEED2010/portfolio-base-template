"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { toFieldErrors, type FormState } from "@/lib/form-helpers";
import { moveRow, nextDisplayOrder } from "@/lib/reorder";
import { requireUser } from "@/lib/supabase/server";

const StatSchema = z.object({
  label: z.string().trim().min(1, { error: "Label is required." }),
  // Free text, not a number: stat blocks mix "50+", "10 yrs", "$2M".
  // See DECISIONS.md — forcing a numeric type blocks real content.
  number: z.string().trim().min(1, { error: "Value is required." }),
});

const read = (formData: FormData) => ({
  label: formData.get("label"),
  number: formData.get("number"),
});

export async function createStat(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const parsed = StatSchema.safeParse(read(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);

  const display_order = await nextDisplayOrder(supabase, "stats");
  const { error } = await supabase
    .from("stats")
    .insert({ ...parsed.data, display_order });
  if (error) return { status: "error", message: error.message };

  revalidatePath("/studio/stats");
  revalidatePath("/");
  redirect("/studio/stats");
}

export async function updateStat(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing record id." };

  const parsed = StatSchema.safeParse(read(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);

  const { error } = await supabase.from("stats").update(parsed.data).eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/studio/stats");
  revalidatePath("/");
  redirect("/studio/stats");
}

export async function deleteStat(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("stats").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/studio/stats");
  revalidatePath("/");
}

export async function moveStat(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await moveRow(supabase, "stats", id, formData.get("direction") === "up" ? "up" : "down");
  revalidatePath("/studio/stats");
  revalidatePath("/");
}
