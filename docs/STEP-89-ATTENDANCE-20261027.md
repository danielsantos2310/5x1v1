# Step 89 — Attendance register (2026-10-27)

Delivered: app/app/live/attendance-register.tsx, scoped getEventAttendance() in app/lib/supabase/data.ts, dashboard wiring and mobile styling.
Admin and coach (real authenticated club roles only) may select a scheduled event, inspect its RLS-visible RSVP participant IDs, select Present/Late/Absent, and explicitly save corrections through the existing attendance upsert.
All read/write requests are made with the current Supabase user session. No service-role/browser bypass. The database validates that coaches are assigned to the event's team and that participants are eligible.
Distinctive empty, busy, error, partial-save and success messages. State is never marked saved before Supabase acknowledges it.

IMPORTANT limitation: This is an RSVP-derived participant list, **not a complete club roster**. Private profiles are not exposed. The UI displays temporary roster numbers and shortened IDs instead of names. Walk-ins and active members without RSVP cannot be selected yet. An RLS-safe name/roster endpoint with club/team authorization must be implemented before production attendance.

Other limitations: current save uses sequential per-player upserts and can partially succeed on network error; UI reports count and advises refresh. Batch atomic save is future work. The old client query for club-wide RSVP/attendance remains capped at 250 records; this event-specific query avoids that cap for the new register. Live sign-in/admin/coach scenarios and browser build remain unverified.

No database mutations or new migrations made for Step 89. Do not run supabase db push without reconciling migration history.
Local QA: git pull origin main; cd app; npm run build; then test /live with authorized test roles, one event with RSVPs, attendance update, duplicate-save corrections, denied team access, mobile layout.
Next: secure roster RPC/view with privacy-limited names, followed by complete roster attendance including non-RSVP members.