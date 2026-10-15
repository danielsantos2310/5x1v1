# 5x1 — Backend implementation / step 57–70 handoff
**Date:** 2026-10-15
**Linked Supabase:** `5x1` (`utlarxjtwzcvyklbmksb`, Frankfurt).
**GitHub:** `danielsantos2310/5x1v1`.
**Scope:** SQL / Supabase implementation only. No real browser sign-in, email verification, or production HTTP integration.

## Completed features by original numbered phase
| Step | Feature | Status |
|---|---|---|
| 57 | Club management | Admin update policy for name, timezone, logo; membership operations. Club bootstrap remains trusted-server-only. |
| 58 | Team management | Admin CRUD for teams and assignment/removal of active club members. |
| 59 | Roles & permissions | Admin club roles, coach team rights, player-only rights. Final-admin lockout guard. |
| 60 | Events | Admin + assigned coach create/update where authorized; admin delete. Team/club scoping. |
| 61 | RSVP | Member RSVP insert/change/cancel, self scoping, deadline, membership/team eligibility. |
| 62 | Capacity | Serialized RSVP capacity enforcement; prevent shrinking event below confirmed RSVPs. |
| 63 | Waitlist | Automatic FIFO placement/promotion on withdrawals and event capacity increases. |
| 64 | Attendance | Authorized admin/team coach recording, updating, reading; user can read own attendance; audit stamp. |
| 65 | Automation | `updated_at` stamps, RSVP `updated_at`, attendance markers, DB triggers. |
| 66 | Notifications | Persistent in-app notification inbox; event-created/changed/cancelled and promotion records. **No email/push delivery**. |
| 67 | Reporting | Admin-only `club_event_participation` SECURITY INVOKER view; separate RSVP and attendance aggregates. |
| 68 | Performance | FK indexes; cached auth.uid in policies; one consolidated RSVP SELECT policy. |
| 69 | Automated tests | Transaction/rollback SQL suites and manual negative tests, described below. |
| 70 | GitHub backup | SQL migrations, generated TypeScript types, integration tests, handoff and migration notes committed. |

## Verified regression suites (rerun after final policy consolidation)
- `app/supabase/tests/backend_integration.sql`: **PASS** — three simulated accounts, going/waitlist status, cap-reduction rejection, automatic promotion, cancellation notification, RLS, rollback.
- `app/supabase/tests/roles_matrix.sql`: **PASS** — coach assigned-team event and player attendance writes permitted; coach clubwide-event creation and club setting changes denied; player event/attendance writes denied, self attendance read permitted; rollback.
- `app/supabase/tests/last_admin_guard.sql`: **PASS** — cannot delete last active administrator role or deactivate final active administrator; rollback.
- Separate ad hoc PASS: capacity increase auto-promoted waiting attendee, `going_count=2,waitlist_count=0`.
- Separate ad hoc PASS: invalid event date, invalid team gender, invalid role rejected.
- Separate ad hoc PASS: four cross-club FK integrity cases rejected (event, RSVP, attendance, team membership).
- Separate ad hoc PASS: anonymous table SELECT disallowed, unknown authenticated UID sees no club/profile/member rows.
- Earlier revocation test (when sole-admin guard did not exist) showed removing an active admin prevented access; current schema correctly **prevents** deactivation of a club's last administrator.

All SQL fixture users use `example.invalid` and are inserted only inside `BEGIN ... ROLLBACK`; final verification showed **zero persisted test Auth rows**.

## Supabase state at phase close
- **10 public tables**, all **RLS enabled**. (Original 9 plus `notifications`.)
- **18 linked Supabase migrations** tracked, all represented by new SQL files in the repo, alongside the older foundational migration.
- **No SECURITY DEFINER functions in `public`** (private authorization/trigger helpers in `app_private`).
- **No TRUNCATE privilege** for `anon` or `authenticated` on public application tables.
- Original test data intact: 1 profile, 2 clubs, 1 active membership, 1 admin role. Other application tables empty.
- Security advisor: **only** `auth_leaked_password_protection` WARN; requires Auth dashboard setting (if plan supports).
- Performance advisor: no WARN; INFO `unused_index` notices expected with essentially empty app tables.

## Critical limits, nonproduction items
1. **Real Auth integration not tested:** signed-in HTTP API, confirmation, reset, refresh, SSR cookie/session handling.
2. **No production-load race test:** RSVP event-row locking was exercised sequentially with multiple simulated identities but not with concurrent HTTP clients.
3. **Club bootstrap/invitations:** club creation and initial administrator assignment must be built as trusted, tested server-side flow. Do not expose a generic browser INSERT on clubs.
4. **Team roster names:** profiles are private; a minimal authorized roster endpoint/view is still needed so coaches can see player names without opening all profiles.
5. **Notifications are in-app records only**; no email/push workers, permission/device token delivery, or notification preference UI.
6. **Actual frontend screens and actions still need integration** using the generated schema types.
7. **Multi-club exhaustive role matrix not fully tested** with deployed sessions and real independent clubs/users.
8. **Auth leaked-password protection** still requires configuration.
9. **Migration baseline/history mismatch:** see `MIGRATION-RECONCILIATION-20261015.md`; do not run `supabase db push` against this existing project blindly.
10. **Indexes marked unused** must be reassessed after realistic production load; do not drop solely because database is currently empty.

## Resume checkpoint
**Backend Steps 57–70 finished within SQL-only scope.** Resume with:
1. Reconcile GitHub migration versions and existing linked Supabase migration history before CLI deployment.
2. Implement trusted initial club bootstrap/invites and authorized player roster projection.
3. Wire up Next.js frontend (mock user sessions first if real Auth unavailable), and then real Auth end-to-end when possible.
4. Add actual concurrent RSVP tests, invite lifecycle, and delivery mechanisms before production rollout.

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security
