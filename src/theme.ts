// The one file a fork edits to restyle the whole site.
//
// Everything visual reads from here. Values are mirrored into CSS
// custom properties in globals.css — change them in BOTH places, or
// better, change them here and let globals.css reference the same
// hex. Kept as TS (not only CSS) so components can read tokens where
// a class name won't do.

export const theme = {
  colors: {
    // Deep slate ink. Text, dark surfaces, the header when solid.
    primary: "#14181C",
    // Muted teal. CTAs, links, focus rings, the one thing that draws
    // the eye. Deliberately not yellow and not SaaS-indigo.
    accent: "#2E6E68",
    accentHover: "#245853",
    accentLight: "#3E8A83",

    // Warm-tinted neutrals rather than pure grays — pure #888 grays
    // are the tell of a default template.
    neutral: {
      50: "#FAF9F7",
      100: "#F4F2EF",
      200: "#E8E4DF",
      300: "#D6D1CA",
      400: "#A9A29A",
      500: "#7D766D",
      600: "#5C5650",
      700: "#423E39",
      800: "#2B2825",
      900: "#1A1917",
    },
  },

  // Two families: a variable serif for display, a workhorse sans for
  // body. Actual loading happens in layout.tsx via next/font/google;
  // these are the CSS variable names those fonts are bound to.
  fonts: {
    display: "var(--font-display)",
    body: "var(--font-body)",
  },

  // A deliberate scale, not ad-hoc values. Roughly a 1.5 ratio at the
  // top end so section rhythm is obvious rather than accidental.
  spacing: {
    section: "clamp(5rem, 12vw, 9rem)",
    gutter: "clamp(1.25rem, 5vw, 2.5rem)",
    maxWidth: "72rem",
  },

  motion: {
    // Cap. Anything longer reads as sluggish on a portfolio.
    duration: "300ms",
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
} as const;

export type Theme = typeof theme;
