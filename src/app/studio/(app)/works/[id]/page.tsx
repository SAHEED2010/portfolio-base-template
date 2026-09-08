import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Work } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { updateWork } from "../actions";
import { WorkForm } from "../work-form";

export const metadata: Metadata = { title: "Edit work" };

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <h1 className="font-display text-3xl tracking-tight text-ink">
        Edit work
      </h1>
      <div className="mt-8">
        <WorkForm work={data as Work} action={updateWork} />
      </div>
    </div>
  );
}
