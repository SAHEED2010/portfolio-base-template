import { Reveal } from "../reveal";
import { SectionHeader, SectionShell } from "../section-header";
import type { Work } from "@/lib/content";
import { settingString, type SettingsMap } from "@/lib/settings";

// FRONTEND_SPEC §2.4. Two columns at md and up — three would turn
// work into thumbnails; two gives each project presence.
//
// The whole card is one <a>, which on touch means the entire card is
// the tap target rather than a small title link. Hover effects are
// enhancement only: nothing they reveal is needed to use the card,
// because touch devices never fire them.

export function Works({
  settings,
  works,
}: {
  settings: SettingsMap;
  works: Work[];
}) {
  if (works.length === 0) return null;

  return (
    <SectionShell id="works">
      <SectionHeader
        eyebrow={settingString(settings, "label_works")}
        heading={settingString(settings, "works_heading")}
        intro={settingString(settings, "works_intro")}
      />

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:mt-16 lg:gap-12">
        {works.map((work, i) => (
          <Reveal key={work.id} delay={i * 80}>
            <a
              href={work.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group tap block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-neutral-100">
                {/* Accent wash that fades in over the image on hover —
                    ties the card to the palette instead of relying on
                    scale alone. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 bg-accent/0 transition-colors duration-[400ms] group-hover:bg-accent/10"
                />
                {work.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={work.image_url}
                    alt={work.title}
                    className="h-full w-full object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-100 to-accent/15">
                    <span
                      aria-hidden
                      className="font-display text-6xl text-neutral-300"
                    >
                      {work.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl tracking-tight text-ink transition-colors duration-200 group-hover:text-accent sm:text-2xl">
                    {work.title}
                  </h3>
                  {work.subtitle && (
                    <p className="mt-1.5 text-sm text-muted">
                      {work.subtitle}
                    </p>
                  )}
                </div>

                {/* Always visible, not hover-revealed — on touch there
                    is no hover, and this is the cue that the card
                    leaves the site. */}
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                >
                  ↗
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
