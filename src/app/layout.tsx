import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { getSettings, settingString } from "@/lib/settings";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";

// next/font/google downloads and self-hosts these at BUILD time — no
// runtime request to Google, no layout shift. `variable` exposes each
// as a CSS custom property that globals.css binds to --font-display /
// --font-body.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Metadata comes from the DB too — a fork edits SEO in the studio,
// not in code. `generateMetadata` is the App Router's async version
// of the static `metadata` export.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  // No render-time fallback text: site_title is a structural key that
  // the studio blocks from saving blank, so it should never actually
  // be empty in practice. A fallback like "Portfolio" here would be
  // template copy that could silently ship to a client's live site.
  const title = settingString(settings, "site_title");
  const description = settingString(settings, "seo_description");

  return {
    title,
    description,
    // Link previews matter more than usual here: these sites are
    // shared into WhatsApp and Instagram DMs, where the card IS the
    // first impression. Forks should add an image via
    // app/opengraph-image — the base ships no binary assets.
    openGraph: {
      title,
      description,
      type: "website",
      siteName: title,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Tints the browser chrome on mobile to match the page background —
// two entries so it follows the OS setting, same as the CSS. This
// only tracks prefers-color-scheme; an explicit in-page toggle choice
// can't retarget a static <meta> tag, which is a real but minor gap
// (the page content itself is never wrong — only this one browser-
// chrome color can lag an explicit override until the OS agrees).
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#17181a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        {/* Flash-free even though Next places this after its own
            generated <head> tags, not literally first — see
            src/lib/theme-script.ts for the verified mechanism. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <a
          href="#top"
          className="skip-link rounded-full bg-accent px-5 py-3 text-sm font-medium text-neutral-50"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
