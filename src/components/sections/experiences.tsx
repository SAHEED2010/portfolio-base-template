import { Reveal } from "../reveal";
import { SectionHeader, SectionShell } from "../section-header";
import type { Experience } from "@/lib/content";
import { formatDateRange } from "@/lib/format";
import { settingString, type SettingsMap } from "@/lib/settings";

// FRONTEND_SPEC §2.3. Date rail + content rows, not a card grid and
// not a dotted timeline. Reads like a well-set CV.
//
// `type` is displayed only — never used for grouping or branching.
// It's free text, so its values can't be relied on across forks.

export function Experiences({
  settings,
  experiences,
}: {
  settings: SettingsMap;
  experiences: Experience[];
}) {
  if (experiences.length === 0) return null;

  return (
    <SectionShell id="experiences">
      <SectionHeader
        eyebrow={settingString(settings, "label_experiences")}
        heading={settingString(settings, "experiences_heading")}
        intro={settingString(settings, "experiences_intro")}
      />

      <ol className="mt-12 lg:mt-16">
        {experiences.map((exp, i) => (
          <li
            key={exp.id}
            className={
              i < experiences.length - 1 ? "border-b border-neutral-200" : ""
            }
          >
            <Reveal delay={i * 80}>
              {/* Stacked on phones with the date first, so the
                  chronology still reads top-to-bottom. The rail only
                  appears once there are 12 columns to split. */}
              <div className="grid gap-2 py-8 lg:grid-cols-12 lg:gap-8 lg:py-10">
                <div className="lg:col-span-3">
                  <p className="text-sm tabular-nums text-neutral-500">
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </p>
                </div>

                <div className="lg:col-span-9">
                  <h3 className="font-display text-xl tracking-tight text-primary sm:text-2xl">
                    {exp.title}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-2">
                      {exp.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={exp.logo_url}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      )}
                      <span className="text-base text-neutral-600">
                        {exp.org}
                      </span>
                    </span>

                    {exp.type && (
                      <span className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                        {exp.type}
                      </span>
                    )}
                  </div>

                  {exp.description && (
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-600">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
