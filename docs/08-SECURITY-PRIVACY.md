# SECURITY & PRIVACY — Controls and Legal Workstream
Version 0.1 | Technical design notes; requires competent legal review

## Regulations and geography
5x1 intends to serve Ireland/EU, UK and Brazil, so assess EU GDPR, UK GDPR and Brazilian LGPD. Applicable law depends on controller/processor roles, establishments, data subjects and processing—not merely hosting region. Start with an explicit EU region for IVI (proposed Ireland `eu-west-1`); UK and Brazil expansion needs separate transfer and hosting decisions. Supabase currently supports Ireland, London and São Paulo regions as distinct project choices, not automatic multi-region residency inside one project.

## Controller/processor decisions
Decide whether each club is a data controller and platform operator is processor (or a different allocation) for each processing purpose. Define contracts, DPA, subprocessors, lawful bases, transparency, requests handling, retention, and breach procedures before production. Review analytics, email, support, hosting, logs and backup vendor access.

## Security requirements
- Enforce HTTPS, secure session cookies, CSRF protections for appropriate operations, rate limiting, safe password reset and MFA for admins (recommended).
- RLS default deny; administrative access tested against guessed identifiers and mixed memberships.
- Store invite tokens as hashes; short expiration, revocation, abuse throttling.
- Audit invite creation, role changes, team changes, attendance corrections and sensitive data exports.
- Secrets only in secured runtime env; scan for leaked keys; isolate environments.
- Encrypt in transit and at rest via platform facilities, check backup access and restores.
- Do not log passwords, tokens, email content or full youth profiles.

## Minor participants
Minors may belong to clubs. v1 excludes guardian workflows but that does not remove child-data compliance requirements. Before enrolling minors: legal basis, age-specific transparency, data minimization, visibility settings, safeguarding and support contacts, access and deletion requirements; consider restricting under-18 onboarding until this work is approved. Member-visible minors profile should be name+club only per supplied product draft, and even this needs a necessity assessment.

## Privacy UX requirements
Clear policy and age handling, privacy/contact route, access/export/correction/deletion request channel, consent preference only where consent is appropriate, preference history as required, least-privilege member directory, no public roster by default.

## Retention and requests
Specify different schedules for pending invites, audit events, member accounts, event history, attendance, support and backups. Data export and deletion must consider legal retention exceptions and downstream backups; do not promise instant erasure from all systems.

## Residency/transfer architecture decision
Option A (initial): EU-hosted primary for IVI; assess UK/Brazil transfers and prohibit regional guarantees not implemented.
Option B (later): separate regional projects/data planes with a global routing/control plane only if compliance/legal/business needs justify cost; avoid synchronizing personally identifiable data across regions by default.

## Sources (official)
- https://supabase.com/docs/guides/platform/regions
- https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq
- https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/rules-international-data-transfers_en
- https://www.gov.uk/data-protection
- https://www.gov.br/anpd/pt-br