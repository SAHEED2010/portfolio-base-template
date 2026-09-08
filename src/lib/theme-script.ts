// The no-flash theme script.
//
// Runs as an inline, synchronous, un-deferred <script>. Checked
// directly against the rendered HTML rather than assumed: Next.js's
// App Router injects its own generated <head> tags (charset,
// viewport, image/font preloads, the stylesheet <link>) ahead of
// anything authored in the layout, so this script does NOT end up
// textually first — an earlier version of this comment claimed it
// did, which the check disproved.
//
// It's still flash-free, for a different reason: encountering
// <link rel="stylesheet"> only starts an async fetch — it doesn't
// block the parser from reaching this script, which then runs
// immediately and sets data-theme before the DOM is even fully
// built. The browser's actual PAINT is what's gated on the
// stylesheet finishing, and that gate holds regardless of where the
// link sits in the source, so data-theme is correct well before
// anything is drawn.
//
// It sets data-theme via a plain DOM call, never through React, so
// React's server-rendered <html> (which carries no data-theme prop
// at all) never disagrees with the client and no hydration-mismatch
// warning is possible.
//
// Exported as a string, not a .js file loaded via <script src>: an
// external file would itself be an extra render-blocking network
// request, defeating the purpose.
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
    // Anything else — absent, corrupted, a stray value from a future
    // version — falls through to no attribute at all, which hands
    // control to the prefers-color-scheme media query in globals.css.
    // That media query updates live with the OS with zero JS, which
    // is exactly the "system" behaviour and needs no listener here.
  } catch (e) {
    // localStorage can throw (Safari private mode). Falling through
    // to system/no-attribute is the correct failure mode, not a
    // crash before the page has rendered anything.
  }
})();
`;
