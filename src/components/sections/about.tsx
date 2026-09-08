import { Reveal } from "../reveal";
import { SectionHeader, SectionShell } from "../section-header";
import type { Stat } from "@/lib/content";
import { settingString, type SettingsMap } from "@/lib/settings";

// FRONTEND_SPEC §2.1. Full-width single column — deliberately NOT the
// hero's 7/5 split, because repeating that immediately below reads
// mechanical. Stats live here (they have no section of their own).

export function About({
  settings,
  stats,
}: {
  settings: SettingsMap;
  stats: Stat[];
}) {
  const eyebrow = settingString(settings, "label_about");
  const heading = settingString(settings, "about_heading");
  const intro = settingString(settings, "about_intro");

  // Section hides entirely when it has nothing to say.
  if (!heading && !intro) return null;

  return (
    <SectionShell id="about">
      <SectionHeader eyebrow={eyebrow} heading={heading} intro={intro} />

      {stats.length > 0 && (
        // 2x2 on phones — four numbers in a row at 375px would shrink
        // them to the point of being unreadable.
        <div className="mt-16 grid grid-cols-2 gap-8 lg:mt-20 lg:grid-cols-4 lg:gap-0">
          {stats.map((stat, i) => (
            <Reveal key={stat.id} delay={i * 80}>
              {/* Hairline dividers only once the stats sit in one row. */}
              <div className="lg:border-l lg:border-neutral-200 lg:pl-6">
                <p className="font-display text-4xl tracking-tight text-primary lg:text-5xl">
                  {stat.number}
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.12em] text-neutral-500">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
