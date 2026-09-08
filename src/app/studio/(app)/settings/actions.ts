"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/lib/form-helpers";
import { findGroup, type SettingFieldDef } from "@/lib/studio/settings-fields";
import { requireUser } from "@/lib/supabase/server";

// One action handles every group: the field map describes the shape,
// so there is no per-group hand-written parsing. A fork that adds a
// setting to the map gets a working save for free.

function parseListString(formData: FormData, key: string): string[] {
  const items: string[] = [];
  for (let i = 0; formData.has(`${key}.${i}`); i++) {
    items.push(String(formData.get(`${key}.${i}`) ?? "").trim());
  }
  return items.filter((v) => v !== "");
}

function parseListObject(
  formData: FormData,
  key: string,
  fields: { name: string; type: string }[],
): Record<string, unknown>[] {
  const items: Record<string, unknown>[] = [];
  for (let i = 0; fields.some((f) => formData.has(`${key}.${i}.${f.name}`)); i++) {
    const row: Record<string, unknown> = {};
    let hasContent = false;
    for (const f of fields) {
      if (f.type === "checkbox") {
        // Unchecked checkboxes send nothing at all — presence of the
        // key IS the value, there's no empty string to check.
        row[f.name] = formData.has(`${key}.${i}.${f.name}`);
      } else {
        const v = String(formData.get(`${key}.${i}.${f.name}`) ?? "").trim();
        row[f.name] = v;
        if (v !== "") hasContent = true;
      }
    }
    if (hasContent) items.push(row);
  }
  return items;
}

/** Zod v4: top-level z.email()/z.url(), `error` for the message. */
function validateScalar(field: SettingFieldDef, raw: string): string | null {
  const trimmed = raw.trim();

  if (field.required && trimmed === "") {
    return `${field.label} is required.`;
  }
  if (trimmed === "") return null; // optional and blank — fine

  if (field.type === "email") {
    const r = z.email({ error: "Enter a valid email address." }).safeParse(trimmed);
    if (!r.success) return z.flattenError(r.error).formErrors[0];
  }
  if (field.type === "url" || field.type === "image") {
    const r = z.url({ error: "Enter a full URL, including https://" }).safeParse(trimmed);
    if (!r.success) return z.flattenError(r.error).formErrors[0];
  }
  return null;
}

export async function updateSettingsGroup(
  groupId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const group = findGroup(groupId);
  if (!group) {
    return { status: "error", message: "Unknown settings group." };
  }

  const { supabase } = await requireUser();

  const fieldErrors: Record<string, string[]> = {};
  const writes: { key: string; value: unknown }[] = [];

  for (const field of group.fields) {
    if (field.type === "list-string") {
      writes.push({ key: field.key, value: parseListString(formData, field.key) });
      continue;
    }

    if (field.type === "list-object" && field.itemFields) {
      writes.push({
        key: field.key,
        value: parseListObject(formData, field.key, field.itemFields),
      });
      continue;
    }

    // text, textarea, email, url, image — all scalar strings.
    const raw = String(formData.get(field.key) ?? "");
    const err = validateScalar(field, raw);
    if (err) {
      fieldErrors[field.key] = [err];
      continue;
    }
    // Optional and blank stores JSON null, not an empty string — a
    // blank optional setting should read as ABSENT on the public
    // site, not as an empty-string value a template might render.
    writes.push({ key: field.key, value: raw.trim() === "" ? null : raw.trim() });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors };
  }

  // One row per key — site_settings has no batch-upsert shortcut
  // simpler than this, and a group is at most ~7 keys.
  for (const { key, value } of writes) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);
    if (error) {
      return { status: "error", message: `Saving ${key} failed: ${error.message}` };
    }
  }

  revalidatePath(`/studio/settings/${groupId}`);
  revalidatePath("/studio/settings");
  revalidatePath("/");
  redirect("/studio/settings");
}

// Unmapped keys — present in the database but absent from the field
// map — still need to be editable rather than invisible. This is the
// loud-fail path: they're never silently hidden.
export async function updateUnmappedSetting(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const key = String(formData.get("key") ?? "");
  if (!key) return { status: "error", message: "Missing key." };

  const raw = String(formData.get("value") ?? "").trim();
  const { error } = await supabase
    .from("site_settings")
    .update({ value: raw === "" ? null : raw })
    .eq("key", key);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/studio/settings");
  revalidatePath("/");
  redirect("/studio/settings");
}
