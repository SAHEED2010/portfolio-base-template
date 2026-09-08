import {
  settingArray,
  settingString,
  type SettingsMap,
  type SocialLink,
} from "@/lib/settings";

// FRONTEND_SPEC §2.7. Not one of the six sections, but without it the
// page stops rather than ends. No motion — a footer is not a moment.

export function SiteFooter({ settings }: { settings: SettingsMap }) {
  const title = settingString(settings, "site_title");
  const note = settingString(settings, "footer_note");
  const socials = settingArray<SocialLink>(settings, "social_links");

  return (
    <footer className="border-t border-neutral-200">
      <div
        className="mx-auto flex w-full flex-col gap-6 py-12 text-center md:flex-row md:items-center md:justify-between md:text-left"
        style={{ maxWidth: "var(--measure)", paddingInline: "var(--gutter)" }}
      >
        <div>
          {title && (
            <p className="font-display text-base text-primary">{title}</p>
          )}
          {note && <p className="mt-1 text-sm text-neutral-500">{note}</p>}
        </div>

        <div className="flex flex-col items-center gap-4 md:items-end">
          {socials.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-6">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex min-h-[44px] items-center text-sm text-neutral-500 hover:text-accent"
                >
                  {social.label}
                </a>
              ))}
            </div>
          )}
          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()}
            {title ? ` ${title}` : ""}
          </p>
        </div>
      </div>
    </footer>
  );
}
