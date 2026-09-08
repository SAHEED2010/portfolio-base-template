import type { Metadata } from "next";
import Link from "next/link";
import { StudioPage } from "@/components/studio/page-header";
import { getSettings } from "@/lib/settings";
import { SETTINGS_GROUPS, mappedKeys } from "@/lib/studio/settings-fields";
import { UnmappedSettingForm } from "./unmapped-setting-form";

export const metadata: Metadata = { title: "Site content" };

export default async function SettingsPage() {
  const settings = await getSettings();
  const mapped = mappedKeys();
  const unmapped = Object.keys(settings).filter((key) => !mapped.has(key));

  // Loud-fail, on the server where a developer will actually see it:
  // a key that exists in the database but not in the field map is a
  // fork that added a setting without teaching the studio how to edit
  // it. It still renders below — this is a nudge to fix the map, not
  // a hard error.
  if (unmapped.length > 0) {
    console.warn(
      `[studio/settings] ${unmapped.length} key(s) not in the field map: ${unmapped.join(", ")}. ` +
        "Add an entry to src/lib/studio/settings-fields.ts.",
    );
  }

  return (
    <StudioPage>
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px w-8 bg-accent" />
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Site content
        </p>
      </div>
      <h1 className="font-display mt-5 text-3xl tracking-tight text-primary">
        Everything visitors read
      </h1>
      <p className="mt-2 max-w-xl text-base text-neutral-600">
        Headings, intros, and contact details — grouped by where they appear
        on your site.
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {SETTINGS_GROUPS.map((group) => (
          <li key={group.id}>
            <Link
              href={`/studio/settings/${group.id}`}
              className="group block rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300"
            >
              <p className="text-base font-medium text-primary transition-colors group-hover:text-accent">
                {group.label}
              </p>
              {group.description && (
                <p className="mt-1 text-sm text-neutral-500">
                  {group.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {unmapped.length > 0 && (
        <div className="mt-12 border-t border-neutral-200 pt-10">
          <h2 className="font-display text-xl text-primary">
            Other settings
          </h2>
          <p className="mt-1 max-w-xl text-sm text-neutral-500">
            These keys exist but aren&apos;t part of a curated group yet.
            Edited as plain text here in the meantime.
          </p>

          <div className="mt-6 flex max-w-2xl flex-col gap-6">
            {unmapped.map((key) => (
              <UnmappedSettingForm
                key={key}
                settingKey={key}
                value={typeof settings[key] === "string" ? (settings[key] as string) : ""}
              />
            ))}
          </div>
        </div>
      )}
    </StudioPage>
  );
}
