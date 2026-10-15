# 5x1 — Frontend foundation / Steps 71–80
Date: 2026-10-15. Repository: danielsantos2310/5x1v1

## Implemented in GitHub
- `app/app/page.tsx`: React / Next.js client workspace with desktop sidebar and phone bottom navigation.
- `app/app/workspace.module.css`: responsive 5x1 navy/green/orange design tokens, keyboard focus, light/dark themes, mobile drawer layout.
- `app/lib/demo-data.ts`: explicitly illustrative data, localized EN + pt-BR labels, and TypeScript data shapes derived from Supabase `Database` types.
- Existing `app/lib/supabase.types.ts`: generated linked Supabase schema types, from the prior backend phase.
- Existing authentication routes remain untouched.

## Step coverage
| Step | Deliverable | Status |
|---|---|---|
| 71 | Frontend workspace and typed module boundary | Implemented (static frontend code) |
| 72 | Switch simulated Admin, Coach, Player roles | Implemented (visual, **not authorization**) |
| 73 | Club overview with hero, illustrative statistics, upcoming events and teams | Implemented |
| 74 | Members list / club settings | Demo list and preferences only; real administrative mutation UI still pending |
| 75 | Team management | Demo team cards + filter; CRUD forms not implemented |
| 76 | Event calendar/list | Demo schedule with type/team filtering and event detail drawer; edit/create forms not implemented |
| 77 | RSVP interface | Demo going/maybe/not-going selection; selection is local-only (no capacity enforcement or remote persistence) |
| 78 | Attendance interface | Demo mark/unmark present/late/absent by participant, local-only |
| 79 | Notifications and reports | Demo notification read toggles; overview summary cards show illustrative figures; connected reports pending |
| 80 | UI testing | Code checked for wiring and proper data isolation; no automated build/browser validation performed in this environment |

## Important: demo trust boundary
Role switcher **never** writes tokens, never calls Supabase Auth, never bypasses RLS.
All data under `demo-data.ts` is fictitious/illustrative (some labels based on IVI club identities).
UI changes are ephemeral React memory only, and reset on reload.
No hidden use of real member information. Authentication pages are separate and unchanged.

## UI contract
- Default locale pt-BR, English switch in Settings.
- Responsive breakpoint 780 px: sidebar becomes bottom navigation.
- Theme per page-local setting; no storage or account preference sync.
- Top-level screen navigation and working event detail drawer.
- Keyboard focus indicators, semantic headings, button types, status text.
- Event dates formatted with `Europe/Dublin` time zone.
- Approved platform colors navy #021C37, green #09CD71, orange #FE6D09.
- Club/tenant name displayed independently from 5x1 platform branding.

## Known limitations / actions required
1. **Build not verified** — Next.js / TypeScript runtime build and browser smoke test still required.
2. Finish real club/team/event/attendance mutation UI forms and validation. Current 'Manage' experience is primarily read-only prototype.
3. Connect actual Supabase sessions; use generated schema types and per-role authorization **from database**, not role picker.
4. Provide authenticated club roster view/API. Profiles are self-private today; demo names are not fetched from Supabase.
5. Add proper responsive QA at 320, 390, 768 and 1280 px and test accessibility with keyboard/screen readers.
6. Add robust loading/empty/error/offline and server-acknowledged save feedback for connected screens.
7. Build any realtime refresh, form submission and notification delivery mechanisms only after real authentication.
8. Reconcile migration history before a fresh environment deploy. See `docs/MIGRATION-RECONCILIATION-20261015.md`.
9. Package versions are ranges and repository may not have a lockfile. Pin versions and commit a verified lockfile before CI/deployment.

## Resume suggestion
Next: set up a preview build (GitHub-connected deployment such as Vercel) and perform actual compilation/browser testing, then finish genuine CRUD screen forms using mocked service interfaces until real authentication can be used.
