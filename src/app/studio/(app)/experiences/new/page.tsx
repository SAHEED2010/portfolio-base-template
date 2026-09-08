import type { Metadata } from "next";
import { StudioPage } from "@/components/studio/page-header";
import { createExperience } from "../actions";
import { ExperienceForm } from "../experience-form";

export const metadata: Metadata = { title: "Add experience" };

export default function NewExperiencePage() {
  return (
    <StudioPage>
      <h1 className="font-display text-3xl tracking-tight text-primary">
        Add experience
      </h1>
      <div className="mt-8">
        <ExperienceForm action={createExperience} />
      </div>
    </StudioPage>
  );
}
