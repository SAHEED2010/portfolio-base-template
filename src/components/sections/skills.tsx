import { Reveal } from "../reveal";
import { SectionHeader, SectionShell } from "../section-header";
import type { Skill } from "@/lib/content";
import { settingString, type SettingsMap } from "@/lib/settings";

// FRONTEND_SPEC §2.2. Editorial numbered list, not tag pills and not
// proficiency bars — `skills` stores only name + display_order, and a
// fabricated "Typography 85%" would undermine credibility on a
// designer's portfolio.

export function Skills({
  settings,
  skills,
}: {
  settings: SettingsMap;
  skills: Skill[];
}) {
  if (skills.length === 0) return null;

  return (
    <SectionShell id="skills">
      <SectionHeader
        eyebrow={settingString(settings, "label_skills")}
        heading={settingString(settings, "skills_heading")}
        intro={settingString(settings, "skills_intro")}
      />

      {/* One column through tablet; two only once there's real width.
          Two columns at 768 would leave each name cramped. */}
      <ul className="mt-12 lg:mt-16 lg:grid lg:grid-cols-2 lg:gap-x-16">
        {skills.map((skill, i) => (
          <li key={skill.id} className="border-b border-border">
            {/* 40ms rather than the usual 80 — this list is long and
                80ms per row would visibly drag. */}
            <Reveal delay={i * 40}>
              {/* Rows aren't links, so the hover state is ambient
                  polish only: the index takes the accent and the name
                  steps right, which makes scanning the list feel
                  responsive without implying it's clickable. */}
              <div className="group flex items-baseline gap-4 py-5">
                <span className="text-xs tabular-nums text-neutral-400 transition-colors duration-200 group-hover:text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-medium text-ink transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 lg:text-xl">
                  {skill.name}
                </span>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
