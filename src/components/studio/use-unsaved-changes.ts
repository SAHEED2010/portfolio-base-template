"use client";

import { useEffect } from "react";

// REUSABLE — every edit screen calls this.
//
// Two escape routes have to be covered separately, because they are
// different mechanisms:
//
//   1. Leaving the site (tab close, reload, external link) —
//      `beforeunload`. The browser shows its own generic dialog; the
//      message is not customisable, by design.
//
//   2. Navigating INSIDE the app (sidebar links) — `beforeunload`
//      does not fire for client-side routing, so those clicks are
//      intercepted in the capture phase before the router sees them.
//
// Missing #2 is the common bug: the guard looks like it works because
// reloading warns, while clicking "Works" in the sidebar silently
// discards the edit.

export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Setting returnValue is what actually triggers the prompt in
      // Chrome; the string itself is ignored by modern browsers.
      event.returnValue = "";
    };

    const onClickCapture = (event: MouseEvent) => {
      // Let modified clicks through — ctrl/cmd/middle open a new tab,
      // which doesn't discard anything.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      // New-tab links leave this page intact.
      if (anchor.target === "_blank") return;
      // External links are handled by beforeunload instead.
      if (/^https?:\/\//i.test(href) && !href.startsWith(location.origin)) {
        return;
      }

      const confirmed = window.confirm(
        "You have unsaved changes. Leave without saving?",
      );
      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    // Capture phase: must run before Next's Link handler.
    document.addEventListener("click", onClickCapture, true);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [dirty]);
}
