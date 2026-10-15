# 5x1 — Step 81: Supabase frontend integration foundation
Date: 2026-10-15.

## Implemented
- app/lib/supabase/browser.ts: typed browser client with public publishable key and legacy anon fallback.
- app/lib/supabase/data.ts: authenticated, RLS-backed snapshot and RSVP/attendance/team/event/notification methods.
- app/app/live/page.tsx: real-session-only page, club selector, event RSVP, teams, notices, loading/error/sign-in states.
- app/app/live/live.module.css: responsive styles.
- app/app/page.tsx: demo-to-live link.
- app/.env.example: public project URL and publishable-key placeholders.

## Runtime rules
1. No public key: show missing-configuration; standalone demo still works.
2. No signed-in user: show login link, do not load private club rows.
3. Authenticated user: read club membership and RLS-visible tables via browser session.
4. Live mutations await server confirmation, then refresh. Backend RLS and triggers remain authoritative.
5. Demo role picker cannot elevate permissions and is never used by the live data layer.
6. Do not expose service_role or secret keys to browser code.

## Verified / not verified
- Source changes committed in GitHub.
- The prior backend rollback SQL suite passed for RLS, RSVP, waitlist, coach roles and administrator protection.
- No authenticated website session has been tested. Real auth remains pending.
- No Next.js build or browser smoke test was run; repository/network access from the available build container is blocked.
- Live page currently wires read and RSVP/notification actions. Write services for attendance, team and event creation exist but do not yet have live CRUD forms.
- Profiles are private per RLS; an approved roster projection/API is required before a real attendance roster UI.
- First-club bootstrap/invitations and Supabase migration-history reconciliation remain outstanding.

## Next step
Set up build/preview CI, run TypeScript typecheck, Next.js build and browser QA. Then integrate the remaining live forms and test with actual signed-in users.

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security