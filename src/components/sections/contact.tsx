import { ContactForm } from "../contact-form";
import { Reveal } from "../reveal";
import { SectionHeader, SectionShell } from "../section-header";
import {
  settingArray,
  settingString,
  splitChannels,
  type ContactChannel,
  type SettingsMap,
  type SocialLink,
} from "@/lib/settings";

// FRONTEND_SPEC §2.6.
//
// Vertical hierarchy, NOT the earlier details/form split. Message
// channels are the primary action and the form is the fallback, and a
// side-by-side split would give them equal visual weight — the exact
// opposite of the intended priority. Stacking states the order
// plainly: message first, write second.
//
// The split was only ever doing work on desktop anyway; at 375px it
// collapsed to this same stack.
//
// Never hidden: unlike the other sections it depends on no rows.

export function Contact({ settings }: { settings: SettingsMap }) {
  const email = settingString(settings, "contact_email");
  const location = settingString(settings, "contact_location");
  const socials = settingArray<SocialLink>(settings, "social_links");
  const channels = settingArray<ContactChannel>(settings, "contact_channels");
  const { primary, secondary } = splitChannels(channels);
  const formLabel = settingString(settings, "contact_form_label");

  return (
    <SectionShell id="contact">
      <SectionHeader
        eyebrow={settingString(settings, "label_contact")}
        heading={settingString(settings, "contact_heading")}
        intro={settingString(settings, "contact_intro")}
      />

      {/* Primary path — one filled button, the rest as quieter
          links, so there's a single obvious action rather than a row
          of equally weighted choices. */}
      {primary && (
        <Reveal delay={180}>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <a
              href={primary.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group tap inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-neutral-50 transition-colors duration-200 hover:bg-accent-hover"
            >
              {primary.label}
              <span
                aria-hidden
                className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
              >
                →
              </span>
            </a>

            {secondary.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                {secondary.map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline inline-flex min-h-11 items-center text-sm text-muted hover:text-accent"
                  >
                    {channel.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {(email || location || socials.length > 0) && (
        <Reveal delay={240}>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
            {/* Shown as readable text, not only as a button — people
                copy an address as often as they click it. */}
            {email && (
              <a
                href={`mailto:${email}`}
                className="link-underline inline-flex min-h-11 items-center text-sm text-muted hover:text-accent"
              >
                {email}
              </a>
            )}
            {location && (
              <p className="text-sm text-muted">{location}</p>
            )}
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline inline-flex min-h-11 items-center text-sm text-muted hover:text-accent"
              >
                {social.label}
              </a>
            ))}
          </div>
        </Reveal>
      )}

      {/* Fallback path — visually demoted behind a hairline so it
          reads as "or, if you'd rather write properly", not as a
          competing call to action. Narrower than full width because
          long input rows are harder to scan. */}
      <Reveal delay={120}>
        <div className="mt-14 border-t border-border pt-12 lg:mt-16">
          {formLabel && (
            <p className="mb-6 max-w-xl text-base text-muted">
              {formLabel}
            </p>
          )}
          <div className="max-w-xl">
            <ContactForm
              submitLabel={settingString(
                settings,
                "contact_submit_label",
                "Send message",
              )}
            />
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
