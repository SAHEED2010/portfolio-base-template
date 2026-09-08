import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioPage } from "@/components/studio/page-header";
import type { Skill } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { updateSkill } from "../actions";
import { SkillForm } from "../skill-form";

export const metadata: Metadata = { title: "Edit skill" };

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("skills").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <StudioPage>
      <h1 className="font-display text-3xl tracking-tight text-primary">
        Edit skill
      </h1>
      <div className="mt-8">
        <SkillForm skill={data as Skill} action={updateSkill} />
      </div>
    </StudioPage>
  );
}
