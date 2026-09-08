import type { Metadata } from "next";
import { StudioPage } from "@/components/studio/page-header";
import { createSkill } from "../actions";
import { SkillForm } from "../skill-form";

export const metadata: Metadata = { title: "Add skill" };

export default function NewSkillPage() {
  return (
    <StudioPage>
      <h1 className="font-display text-3xl tracking-tight text-primary">
        Add skill
      </h1>
      <div className="mt-8">
        <SkillForm action={createSkill} />
      </div>
    </StudioPage>
  );
}
