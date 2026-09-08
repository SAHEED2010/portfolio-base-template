import { selectRows } from "./db";

// site_settings is key/value with a jsonb `value`, so a setting can
// be a string, an array, or an object. These helpers pull it back out
// with a type and a fallback, so a missing row degrades to a sensible
// default instead of rendering "undefined" on the live site.

export type SettingsMap = Record<string, unknown>;

type SettingRow = { key: string; value: unknown };

export async function getSettings(): Promise<SettingsMap> {
  const rows = await selectRows<SettingRow>("site_settings", "select=key,value");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function settingString(
  settings: SettingsMap,
  key: string,
  fallback = "",
): string {
  const value = settings[key];
  return typeof value === "string" ? value : fallback;
}

export function settingArray<T = string>(
  settings: SettingsMap,
  key: string,
  fallback: T[] = [],
): T[] {
  const value = settings[key];
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export type SocialLink = { label: string; url: string };

// Direct-message channels (WhatsApp, Email, Telegram…). Same shape as
// social_links plus an optional `primary` flag.
export type ContactChannel = {
  label: string;
  url: string;
  primary?: boolean;
};

// Exactly one channel is rendered as the filled primary button. The
// first flagged `primary` wins; if a fork flags none (or several),
// the first entry is used — so a malformed array still renders
// sensibly rather than showing no primary action at all.
export function splitChannels(channels: ContactChannel[]): {
  primary: ContactChannel | null;
  secondary: ContactChannel[];
} {
  if (channels.length === 0) return { primary: null, secondary: [] };
  const index = Math.max(
    channels.findIndex((c) => c.primary === true),
    0,
  );
  return {
    primary: channels[index],
    secondary: channels.filter((_, i) => i !== index),
  };
}
