# 5x1 — Cross-club foreign-key isolation: final database test (2026-10-15)
Executed in connected Supabase project 5x1.

A transaction created temporary IVI test team and event, and attempted to cross-wire their references to the second club:
- event.club_id versus team.club_id — foreign-key violation PASS
- RSVP club_id versus event.club_id — foreign-key violation PASS
- attendance club_id versus event.club_id — foreign-key violation PASS
- team_membership.club_id versus team/club membership club_id — foreign-key violation PASS

All temporary rows rolled back. These are relational-integrity tests, distinct from RLS authorization tests.

## Overall database test disposition
- PASS: basic IVI administrator read authorization, unrelated account isolation, anonymous read denial, revoked-member access, privileged function relocation, RLS enabled on 9 tables, TRUNCATE privilege revoked, invalid domain checks, cross-club reference integrity, missing-FK index remediation.
- STILL OPEN: actual HTTP Auth login/email-confirmation/password recovery, per-role real multi-user test fixtures, API write and business rules for events/RSVP/waitlist/attendance, races/concurrency, project-level leaked-password protection, reconciled baseline migrations.
- Performance INFO warnings currently report unused indexes because the database has nearly no application rows; do not remove indexes solely on this basis.

Current linked Supabase migration names:
- move_authorization_helpers_to_private_schema
- restrict_public_table_api_privileges
- index_foreign_key_relationships

Do not replay original foundation migration over manually created schema without reconciliation.
