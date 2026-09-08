import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioPage } from "@/components/studio/page-header";
import type { Experience } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { updateExperience } from "../actions";
import { ExperienceForm } from "../experience-form";

export const metadata: Metadata = { title: "Edit experience" };

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <StudioPage>
      <h1 className="font-display text-3xl tracking-tight text-ink">
        Edit experience
      </h1>
      <div className="mt-8">
        <ExperienceForm
          experience={data as Experience}
          action={updateExperience}
        />
      </div>
    </StudioPage>
  );
}
