-- site_settings.value was NOT NULL, which collides with how
-- PostgREST represents "clear this field": a JSON `null` in an
-- update body maps to SQL NULL for the column, not to the JSON null
-- LITERAL stored as data — those are indistinguishable over the wire.
-- With NOT NULL in place, every attempt to clear an optional setting
-- (e.g. about_intro) failed the constraint and was silently
-- swallowed as a form error by the studio action.
--
-- Found by studio-smoke-test-style verification of the settings
-- screen: a required field correctly blocked a blank save, but an
-- OPTIONAL field's blank save also silently failed instead of
-- clearing.
--
-- Fix matches the settled semantics directly: "optional keys are
-- nullable" (DECISIONS.md) — so the column should just allow NULL.
-- settingString/settingArray already treat a non-string/non-array
-- value (including SQL NULL) as absent, so no application code needs
-- to change.

alter table public.site_settings
  alter column value drop not null;
