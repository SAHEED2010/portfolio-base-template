// The site_settings field map.
//
// This is CANONICAL, not per-fork. A fork extends it (adds an entry
// when it adds its own setting) but never rewrites an existing entry
// — two forks editing hero_phrases get the identical control, because
// the control is a property of the SCHEMA, not of the client
// (DECISIONS.md, Q3).
//
// Every key a fork ever reads through settingString/settingArray must
// have an entry here, or it is invisible in the studio. A key that
// exists in the database but not in this map still renders — as a
// plain text field with a console warning — rather than vanishing
// silently. See settings-group-form.tsx.

export type SettingFieldType =
  | "text"
  | "textarea"
  | "email"
  | "url"
  | "image"
  | "list-string"
  | "list-object";

export type ListObjectFieldDef = {
  name: string;
  label: string;
  type: "text" | "url" | "checkbox";
};

export type SettingFieldDef = {
  key: string;
  label: string;
  type: SettingFieldType;
  /**
   * Structural keys block a blank save with a clear message: they
   * hold up the page's own scaffolding (the H1, the nav, the browser
   * tab title) rather than being content a section can simply omit.
   * Everything else is optional — nullable, and the public site skips
   * rendering it rather than emitting an empty element.
   */
  required?: boolean;
  hint?: string;
  /** For type "image": the Storage folder this upload goes in. */
  folder?: string;
  /** For type "list-object": the shape of each row. */
  itemFields?: ListObjectFieldDef[];
  itemLabel?: string;
};

export type SettingGroupDef = {
  id: string;
  label: string;
  description?: string;
  fields: SettingFieldDef[];
};

export const SETTINGS_GROUPS: SettingGroupDef[] = [
  {
    id: "identity",
    label: "Identity & SEO",
    description: "How your site names and describes itself.",
    fields: [
      {
        key: "site_title",
        label: "Site title",
        type: "text",
        required: true,
        hint: "Used in the nav, footer, and browser tab.",
      },
      { key: "site_tagline", label: "Tagline", type: "text" },
      {
        key: "seo_description",
        label: "Search description",
        type: "textarea",
        hint: "Shown in search results and link previews.",
      },
    ],
  },
  {
    id: "hero",
    label: "Hero",
    description: "The first thing a visitor sees.",
    fields: [
      { key: "hero_greeting", label: "Greeting", type: "text" },
      {
        key: "hero_name",
        label: "Name",
        type: "text",
        required: true,
        hint: "Rendered as the page's main heading.",
      },
      {
        key: "hero_phrases",
        label: "Rotating phrases",
        type: "list-string",
        itemLabel: "Add phrase",
      },
      { key: "hero_intro", label: "Intro", type: "textarea" },
      { key: "hero_cta_primary", label: "Primary button text", type: "text" },
      {
        key: "hero_cta_secondary",
        label: "Secondary button text",
        type: "text",
      },
      {
        key: "hero_portrait_url",
        label: "Portrait",
        type: "image",
        folder: "hero",
        hint: "Optional. Without one, the hero shows your initials.",
      },
    ],
  },
  {
    id: "labels",
    label: "Section labels",
    description:
      "What each section is CALLED. Renamed here with no code change — " +
      "e.g. \"Work\" to \"Cases\" or \"Publications\". Also used in the nav.",
    fields: [
      { key: "label_about", label: "About", type: "text", required: true },
      { key: "label_skills", label: "Skills", type: "text", required: true },
      {
        key: "label_experiences",
        label: "Experience",
        type: "text",
        required: true,
      },
      { key: "label_works", label: "Work", type: "text", required: true },
      {
        key: "label_testimonials",
        label: "Testimonials",
        type: "text",
        required: true,
      },
      {
        key: "label_contact",
        label: "Contact",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "about",
    label: "About",
    fields: [
      { key: "about_heading", label: "Heading", type: "text" },
      { key: "about_intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    id: "skills",
    label: "Skills — section text",
    description: "The skills themselves live under Skills in the sidebar.",
    fields: [
      { key: "skills_heading", label: "Heading", type: "text" },
      { key: "skills_intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    id: "experiences",
    label: "Experience — section text",
    description: "Individual roles live under Experience in the sidebar.",
    fields: [
      { key: "experiences_heading", label: "Heading", type: "text" },
      { key: "experiences_intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    id: "works",
    label: "Work — section text",
    description: "Individual projects live under Works in the sidebar.",
    fields: [
      { key: "works_heading", label: "Heading", type: "text" },
      { key: "works_intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials — section text",
    description: "Individual quotes live under Testimonials in the sidebar.",
    fields: [
      { key: "testimonials_heading", label: "Heading", type: "text" },
      { key: "testimonials_intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    fields: [
      { key: "contact_heading", label: "Heading", type: "text" },
      { key: "contact_intro", label: "Intro", type: "textarea" },
      { key: "contact_email", label: "Email", type: "email" },
      { key: "contact_location", label: "Location", type: "text" },
      {
        key: "contact_channels",
        label: "Message channels",
        type: "list-object",
        itemLabel: "Add channel",
        hint: "One filled button, the rest as links. Mark exactly one Primary.",
        itemFields: [
          { name: "label", label: "Label", type: "text" },
          { name: "url", label: "Link", type: "url" },
          { name: "primary", label: "Primary", type: "checkbox" },
        ],
      },
      {
        key: "contact_form_label",
        label: "Form intro",
        type: "textarea",
        hint: "Shown above the fallback contact form.",
      },
      {
        key: "contact_submit_label",
        label: "Submit button text",
        type: "text",
      },
    ],
  },
  {
    id: "footer",
    label: "Footer & social",
    fields: [
      { key: "footer_note", label: "Footer note", type: "text" },
      {
        key: "social_links",
        label: "Social links",
        type: "list-object",
        itemLabel: "Add link",
        itemFields: [
          { name: "label", label: "Label", type: "text" },
          { name: "url", label: "Link", type: "url" },
        ],
      },
    ],
  },
];

export const ALL_FIELDS: SettingFieldDef[] = SETTINGS_GROUPS.flatMap(
  (g) => g.fields,
);

export function findGroup(id: string): SettingGroupDef | undefined {
  return SETTINGS_GROUPS.find((g) => g.id === id);
}

export function mappedKeys(): Set<string> {
  return new Set(ALL_FIELDS.map((f) => f.key));
}
