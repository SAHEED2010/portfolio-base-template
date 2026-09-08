import { Reveal } from "./reveal";

// The header block every section opens with (FRONTEND_SPEC §1.5):
// accent rule + eyebrow + Fraunces heading + Inter intro. Reuses the
// hero's rule-and-eyebrow motif — this consistency is what makes six
// different layouts read as one page.
//
// `tone="dark"` is only used by the testimonials band, where accent
// switches to accent-light for contrast against #14181C.

export function SectionHeader({
  eyebrow,
  heading,
  intro,
  tone = "light",
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <Reveal>
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className={`h-px w-8 ${dark ? "bg-accent-light" : "bg-accent"}`}
            />
            <p
              className={`text-xs uppercase tracking-[0.22em] ${
                dark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {eyebrow}
            </p>
          </div>
        </Reveal>
      )}

      {heading && (
        <Reveal delay={60}>
          <h2
            className={`font-display mt-5 text-balance text-3xl leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl ${
              dark ? "text-neutral-50" : "text-primary"
            }`}
          >
            {heading}
          </h2>
        </Reveal>
      )}

      {intro && (
        <Reveal delay={120}>
          <p
            className={`mt-4 text-lg leading-relaxed ${
              dark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}

// Shared container. Keeps every section's left edge on the same line
// down the page.
export function SectionShell({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={className}
      style={{
        paddingBlock: "var(--section-y)",
      }}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: "var(--measure)", paddingInline: "var(--gutter)" }}
      >
        {children}
      </div>
    </section>
  );
}
