"use client";

import { useSyncExternalStore } from "react";

// Three explicit states, not an icon that silently swaps meaning:
// System / Light / Dark, each its own button with a real accessible
// name and aria-pressed — never just an icon whose current state is
// only conveyed visually.
//
// Shares one localStorage key ("theme") with src/lib/theme-script.ts,
// which is what makes a preference set in the studio also apply on
// the public site: they're the same Next.js app on one origin (one
// <html>, confirmed — src/app/studio/layout.tsx renders no <html> of
// its own), so there is exactly one localStorage store for both.
//
// Read via useSyncExternalStore, not useEffect+setState: the same
// "setState synchronously within an effect" lint rule that caught the
// hero tagline's reduced-motion check catches reading localStorage
// this way too, for the same reason — it's external state a render
// depends on, not state React owns.

type Choice = "system" | "light" | "dark";

const OPTIONS: { value: Choice; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

// A same-tab custom event: the native "storage" event only fires in
// OTHER tabs, never the one that made the change, so our own button
// clicks would otherwise be invisible to this store.
const THEME_EVENT = "themechange";

function readChoice(): Choice {
  try {
    const stored = localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

// Server render and the client's first render before hydration both
// need to agree with what theme-script.ts already decided visually —
// but since that script deliberately leaves NO attribute for
// "system" (see theme-script.ts), "system" is the only value that is
// ever correct as a snapshot before we can safely read localStorage.
// An explicit stored choice is picked up on the very next paint via
// the subscription, not assumed here.
function getServerSnapshot(): Choice {
  return "system";
}

function applyTheme(choice: Choice) {
  if (choice === "system") {
    try {
      localStorage.removeItem("theme");
    } catch {
      /* see theme-script.ts */
    }
    document.documentElement.removeAttribute("data-theme");
  } else {
    try {
      localStorage.setItem("theme", choice);
    } catch {
      /* see theme-script.ts */
    }
    document.documentElement.setAttribute("data-theme", choice);
  }

  // Keep the mobile browser-chrome tint in sync with an explicit
  // choice too — the static <meta> in layout.tsx only tracks the OS.
  const resolved =
    choice === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : choice;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) =>
      meta.setAttribute("content", resolved === "dark" ? "#17181a" : "#faf9f7"),
    );

  window.dispatchEvent(new Event(THEME_EVENT));
}

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, readChoice, getServerSnapshot);

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = choice === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => applyTheme(option.value)}
            className={[
              "tap min-h-8 rounded-full px-3 text-xs transition-colors duration-200",
              active ? "bg-accent text-neutral-50" : "text-muted hover:text-ink",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
