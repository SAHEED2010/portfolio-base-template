"use client";

import { useState } from "react";

// Marquee wrapper with an explicit pause control.
//
// The cards themselves stay server-rendered and are passed in as
// children — this component only owns the paused state and the
// button, so the testimonials section doesn't become a client
// component just to get a toggle.
//
// The control is not optional polish: hover and focus pausing don't
// exist on touch, so without a real button a phone user cannot stop
// moving text. That's WCAG 2.2.2.

export function Marquee({
  children,
  edgePadding,
  pauseLabel,
  playLabel,
}: {
  children: React.ReactNode;
  edgePadding: string;
  pauseLabel: string;
  playLabel: string;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="mt-12 lg:mt-16">
      <div
        className="marquee-track no-scrollbar overflow-hidden"
        style={{ paddingInline: edgePadding }}
      >
        <div
          className={`animate-marquee flex w-max gap-6 ${
            paused ? "is-paused" : ""
          }`}
        >
          {children}
        </div>
      </div>

      <div
        className="mx-auto mt-6 flex w-full justify-end"
        style={{ maxWidth: "var(--measure)", paddingInline: "var(--gutter)" }}
      >
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          aria-pressed={paused}
          aria-label={paused ? playLabel : pauseLabel}
          // Icon-only and quiet, but a real 44px target. Hairline
          // border + accent mark matches the language used elsewhere.
          className="tap flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition-colors duration-200 hover:border-white/30 hover:text-neutral-50"
        >
          {paused ? (
            // Play: a small triangle.
            <span
              aria-hidden
              className="ml-0.5 block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current"
            />
          ) : (
            // Pause: two hairline bars, echoing the rule motif.
            <span aria-hidden className="flex gap-[3px]">
              <span className="block h-3 w-px bg-current" />
              <span className="block h-3 w-px bg-current" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
