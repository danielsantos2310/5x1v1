# 5x1 — Maintained frontend design context
Last reviewed: 2026-10-15. Design authority: `docs/04-DESIGN.md`.

## Product
Volleyball club management PWA; first pilot International Volleyball Ireland (IVI).
Default pt-BR with English switch; mobile court-side tasks and desktop club operations.

## Taste and purpose
Sports operational, not generic analytics SaaS. The center-stage feature is an abstract volleyball court over a deep navy editorial welcome panel; sparse bright green for affirmative actions and orange for attention. Strong compact sans wordmark and tabular numbers, clear tactical labels, restrained panel borders, plentiful white space. Preserve IVI as a tenant identity rather than merge its branding with global 5x1 mark.

## Tokens
- Navy `#021C37`; green `#09CD71`; orange `#FE6D09`
- Light canvas `#F4F7F5`, white panel `#FFFFFF`
- Dark canvas `#06192D`, panel `#0E2940`
- Shared structure `app/app/workspace.module.css`, body font system Arial/Helvetica fallback.

## Canonical owners
- Demo identities/data: `app/lib/demo-data.ts`
- Generated backend table/view contracts: `app/lib/supabase.types.ts`
- Workspace UI state: `app/app/page.tsx`
- Responsive visual tokens, surfaces, navigation: `app/app/workspace.module.css`
- Auth code: existing `app/app/login`, `app/app/auth`, `app/lib/supabase/browser` — DO NOT blend mock role picker with real auth.

## Interaction contract
- All demo mode actions are in memory; no pretend server-confirmed saving. Explicit demo badge.
- Role changes affect visibility only, not security. Backend RLS controls real operations.
- Event detail opens in a right-hand drawer; RSVP segmented choices store a local response only.
- Attendee marking has an explicit demo Save control, accessible pressed states.
- Notification unread flags update in local memory.
- Admin/Coach/Player nav differs; no member management page for non-admin.
- Visible keyboard focus. At widths <=780px use bottom nav, not horizontal overflow.

## To validate before release
Device and keyboard/browser QA, focus trapping and Escape for modal drawer, true session flow, server feedback, optimistic rollback, motion settings, meaningful empty/error states, responsive text scaling, formal WCAG 2.2 AA check.
