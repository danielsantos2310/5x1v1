# 5x1 migration reconciliation warning — 2026-10-15

## What happened
The original nine application tables, RLS policies and helper functions were created **manually** through the Supabase dashboard SQL Editor. GitHub contains an initial `app/supabase/migrations/202610140001_foundation.sql` describing their intended fresh-install schema.

Later work was applied directly through the Supabase plugin's `apply_migration` action, which **records its own Supabase-generated migration versions**. The corresponding SQL was backed up into GitHub files `202610150001_...` through `202610150018_...` for human-readable ordering. Those local file version prefixes **do not equal** the linked project's migration history versions.

Consequently, **DO NOT blindly run `supabase db push` against the linked 5x1 database**. It could attempt to recreate tables, functions and policies already present, or replay already-applied changes.

## What IS currently backed up
- Initial foundation SQL in `app/supabase/migrations/202610140001_foundation.sql`.
- Full SQL for linked plugin-created migrations in `app/supabase/migrations/202610150001_*` through `202610150018_*`.
- Generated TypeScript database schema: `app/lib/supabase.types.ts`.
- Regression tests in `app/supabase/tests/`.
- Test results and outstanding application tasks in `docs/BACKEND-STEP-57-70-HANDOFF-20261015.md`.

## Recommended next time a CLI is available
1. Take a managed DB backup and inspect linked migration history with the Supabase CLI.
2. Compare schema produced by replaying GitHub migrations on a **fresh test database** to the current linked project. Correct any manual-setup drift; do not assume original foundation is identical.
3. Choose a deliberate baseline strategy (e.g., generate a canonical baseline from current schema, then reconcile the history using documented CLI commands). Do not modify `supabase_migrations` history by hand.
4. Align repository migration filenames/history and verify `supabase migration list` / a clean dry run against a separate project.
5. Only then deploy additional migrations to the existing linked database via CLI.
6. Re-run `app/supabase/tests/backend_integration.sql`, `roles_matrix.sql`, and `last_admin_guard.sql` on an isolated staging environment.

## Protected data
The original IVI admin and clubs were not deleted or overwritten. Temporary test users, teams, events, RSVPs, attendance, and notification records were rolled back. The second club is still a development security fixture.

Reference: https://supabase.com/docs/reference/cli/introduction
