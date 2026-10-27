# Step 88 — Event Editing and Cancellation
Date: 2026-10-27.

Implemented: typed authenticated updateEvent and cancelEvent data methods, constrained by club ID, event ID, scheduled status and updated_at; backend RLS authorizes writes.
Live event management form edits title, event type, start/end, venue, capacity and RSVP deadline. Team reassignment intentionally excluded. Cancellation requires explicit second confirmation and changes status rather than deleting rows.
Backend already has in-app notifications for cancellation and event changes. No migration or real-data writes were made in this step.

Verification pending: npm run build, real authenticated admin/coach checks, form validation, stale updates, capacity shrink restriction, cancellation notification, mobile QA.
Known limitation: datetime-local fields use device timezone, not club timezone. Implement timezone-aware conversion and DST handling before production.
Never blindly run supabase db push until migration history is reconciled.

Next on Windows: git pull origin main; cd app; npm run build.