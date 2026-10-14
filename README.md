# 5x1 — Volleyball Club Management

Court-Side: a bilingual (pt-BR / English), mobile-first volleyball club management product. First pilot: International Volleyball Ireland (IVI). Planning and prototype phase; no production backend yet.

## Start here
- [Product requirements](docs/01-PRD.md)
- [Technical requirements](docs/02-TRD.md)
- [User journeys](docs/03-FLOWS.md)
- [UI/UX court-side design](docs/04-DESIGN.md)
- [Implementation plan](docs/05-PLAN.md)
- [Backend architecture](docs/06-BACKEND.md)
- [Testing](docs/07-TESTING.md)
- [Security and privacy](docs/08-SECURITY-PRIVACY.md)

## Prototype
Open [prototype/index.html](prototype/index.html) locally in a browser. It uses mock data only. The UI/UX designs are not a production app.

## Product decisions
PWA first, native apps after v1. First club IVI with multiple men's and women's teams across league divisions. Multi-club isolation required from the first database migration. Guardian accounts deferred to v2. EU, UK and Brazil residency/privacy requirements need legal and hosting verification before launch.

## Working approach
Review product behavior and design before implementing authentication and real data. Prefer feature branches and pull requests; do not commit API secrets or real member data.
