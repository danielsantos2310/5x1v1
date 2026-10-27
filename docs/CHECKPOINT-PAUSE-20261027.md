# 5x1 — Pause and Resume Checkpoint (2026-10-27)

## Current development state
- Steps 86–89 have been committed to GitHub main: live team creation, event creation, edit/cancellation, and RSVP-based attendance.
- Step 90 code committed: privacy-scoped roster SQL in `app/supabase/migrations/202610270001_event_attendance_roster.sql`, typed RPC, and attendance UI showing actual player names including active members without RSVP.
- Step 91 *partially completed*: inspected the linked 18 migrations and recorded a version mapping in `docs/STEP-91-MIGRATION-INVENTORY-20261027.md`. No migration history reconciliation or staging validation done.
- Local Windows build and real authenticated browser validation of Steps 86–90 are pending.
- Existing migration prefixes in GitHub do not equal Supabase migration history; original foundation was manually created. **Never blindly run `supabase db push` on the existing hosted project.**
- The roster RPC is not deployed to hosted Supabase, so the new live attendance screen cannot load the roster until later deployment.
- No real IVI data was modified during Steps 90–91.

## Cost decision / testing strategy
- Supabase-hosted development branch costs **USD $0.01344/hour** according to the project-specific cost quote; user prefers a free option.
- An attempt to create a hosted branch was blocked by cost confirmation; **no hosted branch was created**.
- Choose **local Supabase CLI + Docker Desktop** on Windows for isolated staging tests. Avoid exposing sensitive credentials or connecting destructive commands to production.
- Local Docker Desktop licensing may depend on organization type; verify the installation terms and system prerequisites before proceeding.
- The user is away from their PC; pause now. No work should be represented as having run on the local PC.

## Resume checklist
1. On PC, inspect `git status` and existing `stash@{0}` before altering or restoring stashed changes, then `git pull origin main` when clean.
2. Check whether Docker Desktop and Supabase CLI are installed. Set up a **separate isolated local test database**, not the hosted 5x1 database.
3. Reconcile/replay the foundation and migration version history on staging; confirm schema drift before changing hosted migration history.
4. Apply Step 90 roster SQL **locally** and run security tests: admin allowed, assigned coach allowed, unrelated coach/player/anonymous/other-club denied, inactive members excluded, player names only for permitted roster, no-RSVP members included.
5. Validate function execute grants and perform a local Next.js TypeScript/build test; resolve any migration/API/typing errors.
6. Only after successful staging and deliberate approval, plan hosted deployment and finish Step 91. No production deployment automatically.
7. Later: resume real authenticated /live testing; verify attendance entry correction and notifications.

## Key paths
- `app/app/live/attendance-register.tsx`
- `app/lib/supabase/data.ts`
- `app/lib/supabase.types.ts`
- `app/supabase/migrations/202610270001_event_attendance_roster.sql`
- `app/supabase/tests/step91_roster_privileges.sql`
- `docs/STEP-90-SECURE-ROSTER-20261027.md`
- `docs/STEP-91-MIGRATION-INVENTORY-20261027.md`

## Safety
Never commit `app/.env.local`, secrets, or real personal member data. Supabase RLS and authenticated permissions remain mandatory. Preserve the user's local stash.
