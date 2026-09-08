// Type-only import: erased at compile time, so this doesn't drag
// next/headers into the runtime bundle. Deriving the client type from
// our own helper rather than importing @supabase/supabase-js keeps
// the dependency list to what we actually installed.
import type { createClient } from "./supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// REUSABLE — shared by every ordered table.
//
// Rewrites display_order across the WHOLE list on each move rather
// than swapping the two affected rows. Swapping looks cheaper but
// only works if the existing values are already a clean sequence;
// once a list has duplicates or gaps (from a failed write, a manual
// DB edit, or rows seeded with the same default) a swap either
// does nothing visible or reorders something unrelated. Rewriting is
// self-healing: after any move, the order is 1..n with no gaps.
//
// Cost is n small updates. These lists hold single digits of rows.

export async function moveRow(
  supabase: SupabaseClient,
  table: string,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const { data: rows, error } = await supabase
    .from(table)
    .select("id, display_order")
    .order("display_order", { ascending: true });

  if (error || !rows) {
    throw new Error(`Could not read ${table} to reorder: ${error?.message}`);
  }

  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return;

  const next = [...rows];
  [next[index], next[target]] = [next[target], next[index]];

  // Renumber everything 1..n, so the sequence is always clean
  // afterwards regardless of what it looked like before.
  await Promise.all(
    next.map((row, position) =>
      supabase
        .from(table)
        .update({ display_order: position + 1 })
        .eq("id", row.id),
    ),
  );
}

/**
 * Next display_order for a newly created row — appended to the end.
 * Reads the current max rather than counting rows, so a list with
 * gaps still appends instead of colliding.
 */
export async function nextDisplayOrder(
  supabase: SupabaseClient,
  table: string,
): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.display_order ?? 0) + 1;
}
