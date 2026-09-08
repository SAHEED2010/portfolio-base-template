import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioPage } from "@/components/studio/page-header";
import type { Stat } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { updateStat } from "../actions";
import { StatForm } from "../stat-form";

export const metadata: Metadata = { title: "Edit stat" };

export default async function EditStatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("stats").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <StudioPage>
      <h1 className="font-display text-3xl tracking-tight text-primary">
        Edit stat
      </h1>
      <div className="mt-8">
        <StatForm stat={data as Stat} action={updateStat} />
      </div>
    </StudioPage>
  );
}
