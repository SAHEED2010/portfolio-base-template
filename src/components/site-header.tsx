"use client";

import { useEffect, useState } from "react";

// Sticky header. Nav labels come from site_settings, so a fork
// renaming "Work" to "Publications" updates the nav for free.
//
// The menu trigger is NOT a hamburger. It reuses the site's own
// rule-and-eyebrow motif — accent hairline + Inter uppercase with
// wide tracking — the same pairing used by "HELLO, I'M" and every
// section eyebrow. That makes the control part of the existing type
// system instead of a generic icon borrowed from a template.
//
// Motion: the hairline extends on hover/open, and the word swaps
// MENU/CLOSE. One idea, expressed two ways.

export type NavItem = { id: string; label: string };

export function SiteHeader({
  siteTitle,
  items,
}: {
  siteTitle: string;
  items: NavItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A fixed header over a scrollable page traps scroll on mobile when
  // the panel is open, so lock the body while it is.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Escape closes the panel — expected of anything modal-ish.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || menuOpen
          ? "border-b border-neutral-200/70 bg-neutral-50/85 py-3 backdrop-blur-md"
          : "border-b border-transparent bg-transparent py-5",
      ].join(" ")}
      style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{
          maxWidth: "var(--measure)",
          paddingInline: "var(--gutter)",
        }}
      >
        <a
          href="#top"
          className="font-display link-underline text-lg tracking-tight text-primary hover:text-accent"
        >
          {siteTitle}
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="link-underline text-sm text-neutral-600 hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Rule + word, not three bars. min-h-11 keeps the tap target
            at the 44px floor even though the mark itself is small. */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="group -mr-1 flex min-h-11 items-center gap-2.5 pl-2 pr-1 md:hidden"
        >
          <span
            aria-hidden
            className={[
              "block h-px bg-accent transition-all duration-300",
              menuOpen ? "w-3" : "w-6 group-hover:w-8",
            ].join(" ")}
            style={{
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
          <span className="text-xs uppercase tracking-[0.22em] text-primary">
            {menuOpen ? "Close" : "Menu"}
          </span>
        </button>
      </div>

      {/* Full-height panel so links get real tap targets rather than
          being crammed under the header. */}
      <div
        id="mobile-menu"
        className={[
          "fixed inset-x-0 top-0 -z-10 bg-neutral-50 transition-transform duration-300 md:hidden",
          menuOpen ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
        aria-hidden={!menuOpen}
      >
        <nav
          className="flex flex-col pb-10 pt-24"
          style={{ paddingInline: "var(--gutter)" }}
        >
          {items.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              // Staggered entrance so the list arrives in reading
              // order rather than as one block.
              className="font-display tap flex min-h-11 items-center py-3 text-2xl text-primary transition-all duration-300 hover:text-accent"
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "none" : "translateY(-0.5rem)",
                transitionDelay: menuOpen ? `${120 + i * 50}ms` : "0ms",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
