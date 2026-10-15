# 5x1 Supabase database tests

These scripts are **development-only** and require the existing seeded IVI club / `5x1 Test Admin` profile. They use `auth.users` test fixtures inserted by a privileged SQL Editor session **inside a transaction that ends with `ROLLBACK`**. Do not execute on production. Do not copy test-user credentials into applications.

| Test file | Purpose |
|---|---|
| `security_regression.sql` | Basic read authorization and API role permission checks; note historic last-admin revocation test is superseded by the new guard. |
| `backend_integration.sql` | Full RSVP/waitlist, admin reporting, notifications, cancelled event, capacity invariant. |
| `roles_matrix.sql` | Simulated coach versus player rights and unauthorized operations. |
| `last_admin_guard.sql` | Prevent sole admin role removal and membership deactivation. |

Passing rollback tests are **not** proof of real Supabase Auth sessions, production API permissions, web app integration, or concurrent load safety. See `docs/BACKEND-STEP-57-70-HANDOFF-20261015.md`.
