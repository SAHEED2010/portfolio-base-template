import type { Metadata } from "next";
import Link from "next/link";
import {
  StudioEmptyState,
  StudioPage,
  StudioPageHeader,
} from "@/components/studio/page-header";
import { ReorderControls } from "@/components/studio/reorder-controls";
import { DeleteButton } from "@/components/studio/row-actions";
import type { Skill } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { deleteSkill, moveSkill } from "./actions";

export const metadata: Metadata = { title: "Skills" };

export default async function SkillsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .order("display_order", { ascending: true });
  const skills = (data ?? []) as Skill[];

  return (
    <StudioPage>
      <StudioPageHeader
        eyebrow="Skills"
        title="What you work with"
        description="The order here is the order visitors see."
        actionHref="/studio/skills/new"
        actionLabel="Add skill"
      />

      {skills.length === 0 ? (
        <StudioEmptyState
          title="No skills yet."
          consequence="The Skills section stays hidden on your site until you add one."
        />
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {skills.map((skill, index) => (
            <li
              key={skill.id}
              className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <span className="w-8 shrink-0 pl-1 text-xs tabular-nums text-neutral-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/studio/skills/${skill.id}`}
                  className="link-underline text-base font-medium text-primary hover:text-accent"
                >
                  {skill.name}
                </Link>
              </div>
              <ReorderControls
                id={skill.id}
                isFirst={index === 0}
                isLast={index === skills.length - 1}
                action={moveSkill}
              />
              <DeleteButton id={skill.id} label={skill.name} action={deleteSkill} />
            </li>
          ))}
        </ul>
      )}
    </StudioPage>
  );
}
