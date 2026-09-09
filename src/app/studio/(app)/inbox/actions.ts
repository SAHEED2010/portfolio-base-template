"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";

// No create/edit routes for this table on purpose — messages arrive
// only through the public contact form (already proven by
// rls-smoke-test.mjs: anon INSERT succeeds, everything else on this
// table is authenticated-only). The studio's only jobs are read
// state and deletion.

export async function setMessageRead(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const nextRead = formData.get("read") === "true";
  if (!id) return;

  const { error } = await supabase
    .from("contact_messages")
    .update({ read: nextRead })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/studio/inbox");
  revalidatePath("/studio");
}

export async function deleteMessage(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/studio/inbox");
  revalidatePath("/studio");
}
