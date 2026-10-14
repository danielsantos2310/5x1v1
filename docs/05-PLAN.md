# PLAN — Delivery Roadmap and Implementation Sequence
Version 0.1 | Proposed solo/part-time project schedule

## Timeline and gates
| Phase | Proposed dates | Deliverables | Exit gate |
| --- | --- | --- | --- |
| 0: Specification | 14–31 Oct 2026 | PRD/TRD/FLOWS/DESIGN/PLAN/BACKEND/SECURITY/TESTING, ADR proposals | Product scope and open decisions signed off |
| 1: UX/UI | 1–21 Nov 2026 | Wireframes, bilingual designs, usability review | Four flows approved |
| 2: Foundation | 22 Nov–5 Dec 2026 | Git repository, CI, migrations, auth, RLS, i18n, PWA shell | Signup/login/language works on a phone |
| 3: Core build | 6 Dec 2026–16 Jan 2027 | Clubs, teams, roles, invites, events, RSVP/waitlist, attendance | Four core E2E flows pass |
| 4: IVI pilot | 19 Jan–13 Feb 2027 | Real pilot and issue fixes | 8+ attended sessions, 2 blocker-free weeks |
| 5: Release | 16 Feb–6 Mar 2027 | Accessibility, privacy review, localization QA, staging/prod | Checklist passes; invite-only v1 released |
| 6: Post-v1 | From Mar 2027 | Guardian analysis, recurring events, native feasibility | Prioritized by evidence |

Dates are estimates from the original supplied spec, not commitments. Actual duration is dependent on availability, security/legal review and pilot results.

## Build dependencies
1. Repository, lint/typecheck, test pipeline and migration framework.
2. Database schema, role policy and complete club-isolation tests.
3. Auth and language/profile.
4. Club creation, team configuration, join flow and permissions.
5. Event CRUD with team-scoped visibility.
6. Concurrency-safe RSVP and waitlist transactions.
7. Attendance, notifications and reporting baseline.
8. Accessibility, mobile and security testing; backups/restore drill.
9. IVI pilot, fix, production release.

## Example sprint backlog
| Sprint | Focus | Priority |
| --- | --- | --- |
| S0 | Scope, ADRs, flows, design system | P0 |
| S1 | CI + auth + localization + schema/RLS | P0 |
| S2 | Club setup + invites + membership | P0 |
| S3 | Teams + divisions + rosters + coach assignment | P0 |
| S4 | Events + timezone validation + notifications | P0 |
| S5 | RSVP + waitlist and race-condition tests | P0 |
| S6 | Attendance + audit + pilot preparation | P0 |
| S7 | Pilot bugs, accessibility, security, translation | P0 |
| S8 | Release readiness + backups/restore + deploy | P0 |

## Milestone checks
- M0: Approved documents and roles/residency decisions.
- M1: User can create account, switch locale, access an installable mobile app.
- M2: Admin configures IVI with six distinct team records across applicable division/gender categories.
- M3: RSVPs are atomic and isolate clubs; coaches cannot manipulate another team.
- M4: Pilot observations meet success targets and privacy requirements.
- M5: Release checklist completed; rollback and incident response defined.

## Risks
- Cross-club data leakage -> RLS and adversarial multi-tenant tests before feature build.
- Overselling regional compliance -> region and legal/vendor review before international rollout.
- Mis-modeled roles (coach also player) -> junction tables, no global singleton role.
- RSVP race conditions -> serialized database transaction; load tests.
- Complex admin screens -> task-timed mobile tests.
- Scope creep -> gate v2 features and do not mix with v1.

## Working ritual
Every task has requirement ID, owner, priority, complexity, definition of done, test and dependencies. Keep weekly decision log, changelog and demos. Write migration before client UI that depends on it.


## Design milestone v0.3 — clickable prototype
- [x] Initial light/dark visuals for Player Home and Admin Overview.
- [x] Offline static clickable prototype for both views with sample-only state.
- [ ] Five-user usability review (not yet performed).
- [ ] Refine layouts from feedback and finalize wireframe acceptance.
- [x] Event Detail and Attendance interactions in the v0.4 prototype (client-side simulations only).
- [ ] Responsive tablet/desktop screen-specific design.
- [ ] Real backend, authentication and persisted RSVP (foundation/core build only).

## Milestone 05 — Four-screen validation (v0.5)
- [x] Four primary UI screens available in demonstration prototype.
- [x] Approved brand rules recorded in DESIGN.
- [x] Formal usability test scenarios and acceptance gate documented in [09-PROTOTYPE-VALIDATION.md](09-PROTOTYPE-VALIDATION.md).
- [ ] Five-person moderated user study across roles.
- [ ] Verify 320px/390px layouts, keyboard/screen reader, bilingual text, dark/light contrast.
- [ ] Fix high-severity usability issues and approve the handoff gate.
- [ ] Start backend foundation after the gate is approved.


## Foundation scaffold started — 14 Oct 2026
- [x] Add `app/` Next.js App Router + TypeScript starter to GitHub.
- [x] Create responsive client-side Player Home/Admin Overview and theme/locale switches using demonstrative information.
- [ ] Install dependencies and pass local build/typecheck in a connected developer environment (not performed here).
- [ ] Execute milestone 05 five-person user testing and resolve blockers.
- [ ] Implement production localization infrastructure, PWA assets, CI, auth, DB migrations, tenancy RLS and server-authoritative RSVP only after validation/security review.
**Caution:** this is preparatory scaffold work, not approval of the UX gate or completion of Foundation.


## Foundation code started — 14 October 2026 (implementation checkpoint)
- [x] Initial multi-club SQL schema: profiles, clubs, multi-role memberships, teams, events, RSVP and attendance records.
- [x] Enable RLS and conservative read policies; leave sensitive writes disabled.
- [x] Initial Supabase email authentication pages and reset/confirmation routes.
- [x] Commit example environment configuration and Supabase setup guide.
- [ ] Apply and test migration on isolated Supabase project; audit tenant isolation and identity bootstrap.
- [ ] Configure email confirmation and password recovery end-to-end.
- [ ] Add secure server transactions for club creation, invitations, team/event writes, waitlist/RSVP, and attendance.
- [ ] Add CI, unit/integration/E2E tests and deploy after review.

Current status: code committed, **not** tested against a real database or deployed; client dashboard still demo-only.
