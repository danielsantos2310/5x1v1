# 5x1 — Supabase security test report (2026-10-15)
Project: 5x1 (Frankfurt), Supabase project ref `utlarxjtwzcvyklbmksb`.

## Applied database changes
- Migration `20261015170901_move_authorization_helpers_to_private_schema` moved security-definer helpers into `app_private`. Previous public-RPC security warnings resolved.
- Migration `20261015171141_restrict_public_table_api_privileges` removed API-role TRUNCATE and excessive grants. Signed-in users retain SELECT (subject to RLS), and profile INSERT / selected column UPDATE.

## Verified behavior
- 9/9 public tables have RLS enabled.
- IVI test admin: sees only IVI, own profile, own active membership, `admin` role.
- Authenticated user with unrelated UUID: sees zero profiles/clubs/memberships.
- Anon API role: SELECT on profiles denied with PostgreSQL 42501; other public application table SELECT grants revoked.
- Both `anon` and `authenticated`: TRUNCATE denied for each of the 9 public tables (`has_table_privilege` false).
- Admin membership temporarily marked removed within a transaction: visible club count 0; `is_active_member` false; `is_club_admin` false. Transaction rolled back so the real active membership was preserved.
- Latest security advisor: only remaining warning is leaked password protection disabled, controlled by Supabase Auth settings, not available to modify through current connector.

## Not yet tested / limitations
- Browser and full Auth confirmation/password reset flows (no deployed authenticated client tested).
- Write workflows for clubs, teams, events, RSVP and attendance: deliberate absence of policies means direct client writes are denied. Before feature rollout, build audited server endpoints or explicit least-privilege write policies and test them.
- Multiple **real** authenticated users from different existing clubs and role combinations.
- Capacity and waitlist concurrency; no business-logic implementation yet.
- Cross-club FK corruption cases; schema has composite constraints but needs negative integration tests.
- Existing original foundation migration overlaps database that was created manually: DO NOT replay it blindly.
- Performance advisor found 11 unindexed FK suggestions and 3 unused indexes (new/empty tables). Address prior to production load.

## Next steps
1. Enable leaked password protection in Supabase Auth settings if supported by plan.
2. Build authenticated integration test harness and create dedicated test users/clubs on isolated test database.
3. Define and test least-privilege application writes, RSVP capacity/waitlist semantics and attendance.
4. Reconcile baseline migration with actual linked database before deploying another environment.
5. Run advisors after each migration.

## Source guidance
https://supabase.com/docs/guides/database/postgres/row-level-security
https://supabase.com/docs/guides/auth/password-security
https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
