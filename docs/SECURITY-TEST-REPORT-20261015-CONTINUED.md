# 5x1 — Continued audit (2026-10-15)
See `SECURITY-TEST-REPORT-20261015.md` for steps 56–initial verification.

## More confirmed tests
- **Revoked administrator:** temporary status `removed` produces zero visible clubs, and `is_active_member=false` / `is_club_admin=false`; transaction rolled back.
- **Negative constraints:** invalid event end time, invalid team gender, and unsupported club role are all rejected by CHECK constraints. Tested inside rollback.
- **Permissions:** verified table-by-table `anon` and `authenticated` roles do not have `TRUNCATE`; anonymous table SELECT also revoked. An anonymous SELECT attempt returned permission denied (42501).
- **Cross-user isolation:** unknown authenticated UID sees zero profile, club and membership rows.
- **Indexes:** new migration added indexes for 11 previously unindexed foreign-key warnings. Second advisor scan confirms 0 unindexed foreign-key warnings.
- **Advisor status:** security: 1 Auth password-protection warning; performance: unused index INFO notices, expected on an almost empty schema.

## Remaining incomplete coverage
- Real authenticated HTTP/PostgREST sessions and sign-up/verification/recovery UI.
- Application writes and RSVP/attendance concurrency: the associated INSERT/UPDATE/DELETE policies are not yet implemented; do not treat these flows as production-ready.
- A second, real test user and more extensive multi-club/member role matrix.
- Constraints on relationships and complete fixture-based integration tests.
- Auth leaked-password protection is a separate dashboard setting. See https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Baseline migration mismatch: original manually created foundation must be reconciled, not replayed as-is.
