"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Hero tagline that cycles through phrases from site_settings.
//
// Fade/slide crossfade rather than a typewriter: no layout shift as
// the line grows, and it reads calmer. The phrases are rendered in a
// container with a reserved min-height, so the block never resizes as
// phrases of different lengths swap in.
//
// Honors prefers-reduced-motion by holding the first phrase still —
// a looping animation is exactly what that setting exists to stop.

const VISIBLE_MS = 2800;
const FADE_MS = 300;

// useSyncExternalStore is React's built-in way to subscribe to
// something outside React (here, a media query). Using it instead of
// useEffect+setState avoids the cascading re-render that pattern
// causes, and gives a correct SSR snapshot for free.
function subscribeToReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// On the server there is no matchMedia; assume motion is allowed so
// the markup matches the common case, then correct on hydration.
function getReducedMotionServerSnapshot() {
  return false;
}

export function RotatingText({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (reducedMotion || phrases.length < 2) return;

    let swap: ReturnType<typeof setTimeout>;
    const hold = setTimeout(() => {
      setFading(true);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setFading(false);
      }, FADE_MS);
    }, VISIBLE_MS);

    return () => {
      clearTimeout(hold);
      clearTimeout(swap);
    };
  }, [index, reducedMotion, phrases.length]);

  if (phrases.length === 0) return null;

  return (
    <span
      // aria-live so screen readers announce the change rather than
      // silently swapping text mid-sentence.
      aria-live="polite"
      className="block"
      style={{
        opacity: fading ? 0 : 1,
        transform: fading ? "translateY(-0.4rem)" : "none",
        transitionProperty: "opacity, transform",
        transitionDuration: `${FADE_MS}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {phrases[index]}
    </span>
  );
}
