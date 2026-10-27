# Step 87 — Event Management (October 27, 2026)

## Implemented
- Authenticated `/live` event creation form in `app/app/live/create-event-form.tsx`.
- Linked into `app/app/live/page.tsx` when the currently selected club's **real** membership roles include admin or coach (never the demo role switcher).
- Uses existing typed `createEvent` in `app/lib/supabase/data.ts`, with database-enforced Row Level Security.
- Event types: training, match, social. Fields: title, scoped team (admin may create clubwide), start/end, venue, optional positive capacity and optional RSVP deadline.
- Client validates required title, team membership in displayed club, end after start, deadline no later than start, integer capacity. UTC ISO timestamps are sent to Supabase.
- Pending/save feedback and server-confirmed refresh, plus responsive CSS. No backend migrations or new records created.

## Security / workflow
- Admin can select clubwide or a team event; coach must select a team. Team options are currently all RLS-visible teams; **assigned-team authorization is enforced by Supabase RLS**. A coach may receive a permission error for an unassigned team.
- The form may only be displayed after live authentication succeeds.
- Dates entered with datetime-local are interpreted in the device's local timezone, not necessarily the club's timezone. This is explicitly disclosed; a proper club-timezone conversion widget is a future enhancement.

## Verification
- Changes are committed to GitHub main. The user deferred local/live testing.
- NOT yet build/TypeScript verified on their Windows PC.
- NOT yet end-to-end verified with real authenticated admin/coach accounts.
- Edit/cancel functionality, attendance management UI, and permission-filtered coach team selector are future milestones.

## Local validation steps
1. Ensure local changes are safe and stash is preserved; `git pull origin main`.
2. `cd app && npm install && npm run build`.
3. Later use `/live` while authenticated, test valid and invalid inputs with permitted roles.
4. Do not create sample real events without user approval; the submit button makes genuine database writes.
5. Migration-history mismatch remains; DO NOT blindly run `supabase db push`.

## Next
Step 88: Event editing/cancellation with permission enforcement and protected confirmation, followed by user-facing timezone improvements.
