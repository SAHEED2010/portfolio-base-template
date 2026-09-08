import { Marquee } from "../marquee";
import { SectionHeader } from "../section-header";
import type { Testimonial } from "@/lib/content";
import { initialsFrom } from "@/lib/format";
import { settingString, type SettingsMap } from "@/lib/settings";

// FRONTEND_SPEC §2.5 — the one dark band on the page.
//
// Not built on SectionShell: the scroll track has to break out of the
// container so cards can scroll edge-to-edge on a phone, while the
// first card still lines up with every other section's left edge.
// That alignment is the `max(gutter, (100% - measure) / 2)` padding
// below — gutter on narrow screens, container-aligned on wide ones.
//
// Accent inside this band is accent-light: #2E6E68 does not carry
// enough contrast against #14181C.

const RATING_SCALE = 5;

function RatingDots({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`Rated ${rating} out of ${RATING_SCALE}`}
    >
      {Array.from({ length: RATING_SCALE }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`block h-[5px] w-[5px] rounded-full ${
            i < rating ? "bg-accent-light" : "bg-neutral-700"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials({
  settings,
  testimonials,
}: {
  settings: SettingsMap;
  testimonials: Testimonial[];
}) {
  // No rows means no dark band at all — the page stays uniform
  // neutral-50 rather than showing an empty inverted section.
  if (testimonials.length === 0) return null;

  const edgePadding = "max(var(--gutter), calc((100% - var(--measure)) / 2))";

  return (
    <section
      id="testimonials"
      className="bg-primary"
      style={{ paddingBlock: "var(--section-y)" }}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: "var(--measure)", paddingInline: "var(--gutter)" }}
      >
        <SectionHeader
          tone="dark"
          eyebrow={settingString(settings, "label_testimonials")}
          heading={settingString(settings, "testimonials_heading")}
          intro={settingString(settings, "testimonials_intro")}
        />
      </div>

      {/* Marquee: the cards drift continuously rather than waiting to
          be swiped. The set is rendered twice so a -50% shift lands
          on an identical frame and the loop never visibly jumps.
          Pauses on hover/focus, has an explicit pause control for
          touch, and falls back to a normal scroller under
          prefers-reduced-motion. */}
      <Marquee
        edgePadding={edgePadding}
        pauseLabel="Pause testimonials"
        playLabel="Play testimonials"
      >
        {[0, 1].map((pass) =>
          testimonials.map((t) => (
              <figure
                key={`${pass}-${t.id}`}
                // The second pass is a visual duplicate only — hiding
                // it from assistive tech stops every quote being
                // announced twice.
                aria-hidden={pass === 1}
                className="w-[85vw] shrink-0 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-8 transition-colors duration-300 hover:border-white/20 md:w-[min(60vw,26rem)] lg:w-96 lg:p-10"
              >
                {t.rating !== null && <RatingDots rating={t.rating} />}

                <blockquote
                  className={`font-display text-xl leading-snug text-neutral-50 lg:text-2xl ${
                    t.rating !== null ? "mt-6" : ""
                  }`}
                >
                  {t.quote}
                </blockquote>

                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                    {t.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span aria-hidden className="text-sm text-neutral-400">
                        {initialsFrom(t.name)}
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-neutral-400">{t.name}</span>
                </figcaption>
              </figure>
          )),
        )}
      </Marquee>
    </section>
  );
}
