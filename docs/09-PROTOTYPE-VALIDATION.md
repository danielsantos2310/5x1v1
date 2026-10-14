# Milestone 05 — Four-Screen Prototype Validation

**Version:** 0.5 · **Status:** Test plan prepared, not yet executed · **Date:** 2026-10-14

## Purpose
Validate the Court-Side prototype before v1 foundation engineering. Current `prototype/index.html` is **local demonstration state only**: it is not authentication, durable persistence, authorization, notifications or offline sync. All mock people/event names are sample data.

## Test protocol
- Participants: at least five volunteers covering player, coach and club admin perspectives. Do not use minors or real membership lists for this prototype study.
- Devices: at least one small phone (~320 CSS px), one modern phone (~390 CSS px), plus desktop with keyboard. Test both light/dark and pt-BR/en.
- Each participant starts from a reset demo and completes the tasks below independently.
- Observe taps, completion time, errors and comprehension. Do not coach while timing. Record results without unnecessary personal information.
- A completion is counted only if the participant recognizes the final state correctly.

## Task scenarios

| ID | Role | Task | Expected observable behavior | Pass criterion |
| --- | --- | --- | --- | --- |
| PV-01 | Player | Identify next training, team, venue, capacity and local time | All visible without hunting | 5/5 find event; >=4/5 interpret capacity |
| PV-02 | Player | RSVP `Vou`, then change to `Talvez` | Clear state and change feedback | <=2 taps for RSVP; no ambiguity |
| PV-03 | Player | Switch between assigned teams | Event/team context changes correctly | >=4/5 identify selected team |
| PV-04 | Player | Simulate full event and joining waitlist | Waitlist status and position explicit | 5/5 understand they are not confirmed |
| PV-05 | Coach | Mark all present, then one absent and one late | Unmarked never means absent | All statuses correct |
| PV-06 | Coach | Save attendance | Success/unsaved state distinguishable | >=4/5 understand save status |
| PV-07 | Admin | Find approvals and invite controls | Clear, token not exposed on home | >=4/5 locate action quickly |
| PV-08 | Admin | Find events and teams | Authorized navigation visible | >=4/5 navigate without explanation |
| PV-09 | All | Switch locale to English and back | No mixed strings / clipping | All four screens checked manually |
| PV-10 | All | Toggle light/dark | All labels/buttons remain legible | Manual contrast review |
| PV-11 | All | 200% zoom, keyboard and screen reader | Operable, visible focus, announced status | Audit + issues triaged |
| PV-12 | All | Connection failure and unsaved edits | No false success, retry path | Spec expectation; prototype simulation may not exist yet |

**Note:** PV-04, PV-06 and PV-12 require honest distinction between client-side simulation and server-backed behavior. Mark **Not implemented** rather than claiming success when a scenario is absent.

## Design acceptance gate
- No critical blocker in the four primary flows.
- No known misleading saved/confirmed states.
- All required controls reachable without horizontal scrolling at 320px.
- Primary tap areas target >=48px; minimum WCAG constraints independently checked.
- pt-BR and en reviewed across the primary screens, including error/status strings.
- Admin and player contexts understandable to at least 4 of 5 participants.
- Findings and fixes linked to specific requirement and test IDs.

## Bug/feedback record template
| ID | Screen | Device / locale / theme | Steps | Expected | Actual | Severity | Owner | Resolution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PV-BUG-001 | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Open |

Severity: `Blocker` (unusable/misleading or privacy risk), `Major` (task obstructed), `Minor` (friction), `Polish` (cosmetic).

## Decisions to close before backend
1. Membership/team role representation (multi-role, multi-team, multi-club).
2. Visibility of RSVP lists and minors' information.
3. Waitlist promotion policy when deadline passes; RSVP cutoff for promotions.
4. Coach vs club-admin event cancellation and waitlist override permissions.
5. Attendance scope: expected participants vs all eligible team players.
6. Session time zone policy and locale formatting, including Europe/Dublin DST.
7. Confirmation and offline failure wording (do not claim persistence before server responds).
8. Region-specific deployment/legal strategy for EU/UK/Brazil (not assumed by one database region).

## Exit handoff
Once validated, open Foundation phase tasks for: Next.js/TypeScript/PWA shell, pt-BR/en localization, Supabase schema, auth, membership and role assignments, club-scoped RLS, E2E harness and CI. Do not import real club rosters until policies and privacy are reviewed.

## Related documents
- [Product requirements](01-PRD.md)
- [Flow definitions](03-FLOWS.md)
- [Court-Side and official brand design](04-DESIGN.md)
- [Development plan](05-PLAN.md)
- [Testing and acceptance](07-TESTING.md)
