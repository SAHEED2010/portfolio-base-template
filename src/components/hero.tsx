import { RotatingText } from "./rotating-text";
import {
  settingArray,
  settingString,
  type SettingsMap,
  type SocialLink,
} from "@/lib/settings";

// Server component — no "use client". Only <RotatingText /> is a
// client island, so the hero ships almost no JS.
//
// Layout is a split: content left, portrait right. The right column
// exists because a portfolio hero wants a face, not because the
// composition needed filling — and it degrades to a typographic
// placeholder until a portrait is uploaded via the studio.

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function PortraitPanel({
  portraitUrl,
  name,
  className = "",
}: {
  portraitUrl: string;
  name: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Offset accent frame — one fine rule rather than a box, so it
          reads as considered rather than as a border. Drifts on a
          9s cycle against the panel's 7s so the two never move as a
          single rigid block. */}
      <div
        aria-hidden
        className="animate-float-frame absolute -bottom-3 -right-3 h-full w-full rounded-[1.75rem] border border-accent/25"
      />
      <div className="animate-float relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-neutral-100">
        {portraitUrl ? (
          // Plain <img>: next/image would need remotePatterns wired to
          // the Supabase host, which lands with the upload flow.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={portraitUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-100 to-accent/15">
            <span
              aria-hidden
              className="font-display text-7xl tracking-tight text-neutral-300"
            >
              {initialsFrom(name)}
            </span>
            <span className="sr-only">Portrait placeholder</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Hero({ settings }: { settings: SettingsMap }) {
  const greeting = settingString(settings, "hero_greeting");
  const name = settingString(settings, "hero_name");
  const phrases = settingArray<string>(settings, "hero_phrases");
  const intro = settingString(settings, "hero_intro");
  const ctaPrimary = settingString(settings, "hero_cta_primary");
  const ctaSecondary = settingString(settings, "hero_cta_secondary");
  const socials = settingArray<SocialLink>(settings, "social_links");
  const portraitUrl = settingString(settings, "hero_portrait_url");

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-28 pt-24 sm:pt-28"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/4 right-[-10%] h-[38rem] w-[38rem] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-15%] h-[30rem] w-[30rem] rounded-full bg-neutral-300/30 blur-3xl" />
      </div>

      <div
        className="mx-auto w-full"
        style={{ maxWidth: "var(--measure)", paddingInline: "var(--gutter)" }}
      >
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {/* Mobile portrait: small and above the name, so it reads
                as a profile rather than eating the fold. The full
                panel only appears once there's a column for it. */}
            {(portraitUrl || name) && (
              <div
                className="animate-rise mb-8 h-16 w-16 overflow-hidden rounded-full bg-neutral-100 lg:hidden"
                style={{ animationDelay: "0ms" }}
              >
                {portraitUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={portraitUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-accent/15">
                    <span
                      aria-hidden
                      className="font-display text-lg text-neutral-400"
                    >
                      {initialsFrom(name)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {greeting && (
              <div
                className="animate-rise flex items-center gap-3"
                style={{ animationDelay: "60ms" }}
              >
                {/* The fine rule that anchors the top of the column. */}
                <span aria-hidden className="h-px w-8 bg-accent" />
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  {greeting}
                </p>
              </div>
            )}

            <h1
              className="animate-rise font-display mt-5 text-balance text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]"
              style={{ animationDelay: "120ms" }}
            >
              {name}
            </h1>

            {phrases.length > 0 && (
              <div
                className="animate-rise mt-5 min-h-[3.5rem] sm:min-h-[2.5rem]"
                style={{ animationDelay: "200ms" }}
              >
                <p className="text-xl text-accent sm:text-2xl">
                  <RotatingText phrases={phrases} />
                </p>
              </div>
            )}

            {intro && (
              <p
                className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-muted"
                style={{ animationDelay: "280ms" }}
              >
                {intro}
              </p>
            )}

            <div
              className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
              style={{ animationDelay: "360ms" }}
            >
              {ctaPrimary && (
                <a
                  href="#contact"
                  className="group tap inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-neutral-50 transition-colors duration-200 hover:bg-accent-hover"
                >
                  {ctaPrimary}
                  <span
                    aria-hidden
                    className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                  >
                    →
                  </span>
                </a>
              )}
              {ctaSecondary && (
                // Softer than the filled CTA on purpose: a hairline
                // border in a quiet tone, so the primary action clearly
                // wins the hierarchy. text-muted (theme-reactive), not a
                // fixed light-mode neutral — text-neutral-700 here failed
                // WCAG AA (1.67:1) against the dark-mode page background.
                <a
                  href="#works"
                  className="tap inline-flex min-h-11 items-center justify-center rounded-full border border-border px-7 py-3.5 text-sm font-medium text-muted transition-colors duration-200 hover:border-neutral-400 hover:text-ink"
                >
                  {ctaSecondary}
                </a>
              )}
            </div>

            {socials.length > 0 && (
              <div
                className="animate-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-2"
                style={{ animationDelay: "440ms" }}
              >
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline inline-flex min-h-11 items-center text-sm text-muted hover:text-accent"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div
            className="animate-rise hidden lg:col-span-5 lg:block"
            style={{ animationDelay: "300ms" }}
          >
            <PortraitPanel portraitUrl={portraitUrl} name={name} />
          </div>
        </div>
      </div>

      {/* Scroll cue. Earns its place on a full-height hero: without
          it there's no signal that the page continues. The line
          animation is killed by the global reduced-motion rule. */}
      <a
        href="#about"
        className="group absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        aria-label="Scroll to content"
      >
        <span className="text-[0.7rem] uppercase tracking-[0.2em] text-neutral-400 transition-colors group-hover:text-accent">
          Scroll
        </span>
        <span
          aria-hidden
          className="relative block h-10 w-px overflow-hidden bg-neutral-200"
        >
          <span className="animate-scroll-cue absolute inset-x-0 top-0 block h-4 bg-accent" />
        </span>
      </a>
    </section>
  );
}
