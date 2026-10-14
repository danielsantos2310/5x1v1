# 5x1 — Documentation Hub
Version: 0.1 | Date: 2026-10-14 | Status: Draft for approval

## Mission
5x1 is a free, bilingual volleyball-club management PWA for club administrators, coaches and players. Launch with International Volleyball Ireland (IVI), designing all data and authorization from day one to support multiple clubs without leaking club information.

## Decisions already supplied
- Product: **5x1**.
- First pilot: **IVI**, approximately six men's/women's teams participating in Divisions 2–4; actual team names/assignments must be configured and confirmed.
- Language: **pt-BR default**, English available as a complete first-class language from launch. For a user's first visit, use saved preference if present; otherwise default to pt-BR (no silent browser override). English remains available through a prominent switch.
- First release: responsive web + installable PWA; native apps after stable v1.
- Roles: club admin, coach and player in v1; guardians in v2.
- v1 free, no payments, chat, scoring or monetization.
- Data-protection design: GDPR, UK GDPR and Brazil LGPD requirements; regional hosting decision is OPEN.
- Confirmed success targets: club/invite/event creation under 5 minutes; RSVP in <=2 taps; attendance recording under 2 minutes. Define the test data and timer start/end before launch.

## Read/build order
1. 01-PRD.md — scope and measurable behavior.
2. 03-FLOWS.md — full user journeys, states, failures.
3. 04-DESIGN.md — screens, mobile-first patterns.
4. 02-TRD.md — architecture, non-functional constraints.
5. 06-BACKEND.md — data, API, isolation, RLS, concurrency.
6. 08-SECURITY-PRIVACY.md — compliance and threat model.
7. 07-TESTING.md — evidence required for each release.
8. 05-PLAN.md — execution order, estimates, release gates.

## Documentation governance
Every feature needs a PRD requirement ID -> flow -> screen -> endpoint/table -> automated test -> release checklist reference. Use pull requests to update relevant documents before implementing behavior changes. Record architectural decisions as ADRs in `adr/` when implementation begins.

## Definition of ready
Scope and actors clear; acceptance criteria testable; authorization matrix agreed; dependencies and migration effects known; mobile/translation cases specified; security implications reviewed.

## Definition of done
Feature implemented, unit/integration/e2e tests passing, RLS verified, accessible on mobile, pt-BR/en translated, errors handled, telemetry safe, documentation updated, reviewed and deployed to staging.

## References
- User-provided initial 5x1 specification (2026-10-14).
- https://nextjs.org/docs/app/guides/progressive-web-apps
- https://nextjs.org/docs/app/guides/internationalization
- https://supabase.com/docs/guides/platform/regions


## Court-side design update (2026-10-14)
Design refinements and acceptance cases are recorded in `01-PRD.md`, `03-FLOWS.md`, `04-DESIGN.md` and `07-TESTING.md`. The app remains in pre-wireframe concept phase; visual mockups are exploratory, not sign-off.