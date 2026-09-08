import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { getSettings, settingString } from "@/lib/settings";

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

// Tints the browser chrome on mobile to match the page background,
// so the app frame doesn't sit as a white band above a warm page.
export const viewport = {
  themeColor: "#FAF9F7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
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
