# v1.0.0 — Phase 1 release notes

This is the frozen base template: public homepage, dark mode, and a
`/studio` admin (auth, works CRUD, the other five tables' CRUD, and a
contact-message inbox) all reading from the seven-table Supabase schema,
verified by four self-cleaning suites (`rls-smoke-test.mjs`,
`storage-smoke-test.mjs`, `studio-smoke-test.mjs`,
`check-seed-drift.mjs`) plus a keep-warm cron. Formally cut from V1 —
not built, not stubbed: booking, payments, i18n, blog, work/project
detail pages, self-serve password reset, Resend email notifications on
new contact messages (client checks `/studio/inbox` instead), and a
custom favicon (ships Next's stock icon). See DECISIONS.md for the
reasoning behind each cut and CLAUDE.md/FRONTEND_SPEC.md for what
*is* here. Fork per `FORKING.md` when the next client is ready.
