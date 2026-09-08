"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { toFieldErrors, type FormState } from "@/lib/form-helpers";
import { moveRow, nextDisplayOrder } from "@/lib/reorder";
import { requireUser } from "@/lib/supabase/server";

const SkillSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
});

const read = (formData: FormData) => ({ name: formData.get("name") });

export async function createSkill(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const parsed = SkillSchema.safeParse(read(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);

  const display_order = await nextDisplayOrder(supabase, "skills");
  const { error } = await supabase
    .from("skills")
    .insert({ ...parsed.data, display_order });
  if (error) return { status: "error", message: error.message };

  revalidatePath("/studio/skills");
  revalidatePath("/");
  redirect("/studio/skills");
}

export async function updateSkill(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing record id." };

  const parsed = SkillSchema.safeParse(read(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);

  const { error } = await supabase.from("skills").update(parsed.data).eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/studio/skills");
  revalidatePath("/");
  redirect("/studio/skills");
}

export async function deleteSkill(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/studio/skills");
  revalidatePath("/");
}

export async function moveSkill(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await moveRow(supabase, "skills", id, formData.get("direction") === "up" ? "up" : "down");
  revalidatePath("/studio/skills");
  revalidatePath("/");
}
