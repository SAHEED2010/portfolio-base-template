import { Hero } from "@/components/hero";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Experiences } from "@/components/sections/experiences";
import { Skills } from "@/components/sections/skills";
import { Testimonials } from "@/components/sections/testimonials";
import { Works } from "@/components/sections/works";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, type NavItem } from "@/components/site-header";
import {
  getExperiences,
  getSkills,
  getStats,
  getTestimonials,
  getWorks,
} from "@/lib/content";
import { getSettings, settingString } from "@/lib/settings";

// Server component. Every DB read happens here and is passed down as
// props — no section fetches its own data, and no section is a client
// component. Promise.all so the six reads go out in parallel rather
// than waterfalling.

export default async function Home() {
  const [settings, skills, experiences, works, testimonials, stats] =
    await Promise.all([
      getSettings(),
      getSkills(),
      getExperiences(),
      getWorks(),
      getTestimonials(),
      getStats(),
    ]);

  const aboutVisible =
    settingString(settings, "about_heading") !== "" ||
    settingString(settings, "about_intro") !== "";

  // A nav link appears only if its label exists AND its section will
  // actually render — otherwise clicking it would scroll to nothing
  // (FRONTEND_SPEC §1.10).
  const navItems: NavItem[] = (
    [
      ["about", "label_about", aboutVisible],
      ["skills", "label_skills", skills.length > 0],
      ["experiences", "label_experiences", experiences.length > 0],
      ["works", "label_works", works.length > 0],
      ["testimonials", "label_testimonials", testimonials.length > 0],
      ["contact", "label_contact", true],
    ] as const
  )
    .filter(([, , visible]) => visible)
    .map(([id, key]) => ({ id, label: settingString(settings, key) }))
    .filter((item) => item.label !== "");

  return (
    <>
      <SiteHeader
        siteTitle={settingString(settings, "site_title")}
        items={navItems}
      />
      <main>
        <Hero settings={settings} />
        <About settings={settings} stats={stats} />
        <Skills settings={settings} skills={skills} />
        <Experiences settings={settings} experiences={experiences} />
        <Works settings={settings} works={works} />
        <Testimonials settings={settings} testimonials={testimonials} />
        <Contact settings={settings} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
