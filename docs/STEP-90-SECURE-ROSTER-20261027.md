# Step 90 — Privacy-controlled Event Roster
Date: 2026-10-27

## Added to GitHub main
- SQL migration `app/supabase/migrations/202610270001_event_attendance_roster.sql` (NOT APPLIED to Supabase).
- Private SECURITY DEFINER helper validates the real authenticated identity and checks that the caller is a club administrator or a coach assigned to the event's team; denies access otherwise. Public RPC entry point is SECURITY INVOKER. Both restricted to authenticated users.
- Only user_id, display_name and optional RSVP status are returned; no emails, phones or private profile metadata.
- For team events, only active players assigned to that team appear. For clubwide events, active club members with the player role appear.
- Includes active players who did not RSVP, enabling attendance marking for walk-ins.
- Updated typed Supabase RPC contract, data layer and attendance-register UI to show player names and RSVP status.

## Critical deployment gate
**The migration is not deployed.** Until migration reconciliation and a reviewed/staging deployment occur, /live attendance will fail with a missing RPC error. Do not run `supabase db push` blindly on existing 5x1 project: historical versions differ from repository filenames.
A security review and role-matrix tests must verify admin, assigned coach, unrelated coach, player-only, cross-club, and inactive membership cases before enabling the RPC.
No user data was read or changed during this step.
Build/TypeScript and authenticated browser checks still pending on local PC.

## Known limitations
- Coach event selection lists RLS-visible events; roster RPC denies unauthorized team access.
- Sequential attendance upserts remain non-atomic; error messages report partial progress.
- Players without an active team assignment do not appear on team-event rosters.
- `display_name` may be empty; fallback remains a generic athlete label.
- Generated TypeScript function contract is updated manually; regenerate on verified schema deployment.

## Next
Migration reconciliation, staging safety tests, then deploy approved SQL and local Next.js build; real browser auth smoke test deferred at user request.
