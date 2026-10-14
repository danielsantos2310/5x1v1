# DESIGN — UI/UX Specification
Version 0.1 | Status: Design direction proposed; no mockups approved

## Design intent
Mobile-first sports utility, simple enough for a coach in a gym and a player responding while walking. Fast task completion over decorative complexity. Do not assume colors or logo are approved for 5x1; first IVI club branding can use its own crest/colors independently of platform brand.

## Information architecture
- Public: landing, language switch, login/signup/reset, invite redemption.
- Player: Home/upcoming, My Teams, Event Detail + RSVP, Notifications, Profile/settings.
- Coach: Player navigation plus Team Events, Attendance and Team Roster.
- Admin: Club Overview, Teams, Members/Approvals, Invitations, Events, Attendance, Club Settings.

## Screen inventory
| ID | Screen | Main elements |
| --- | --- | --- |
| UI-01 | Landing | headline, feature explanation, login, join, language toggle |
| UI-02 | Auth | signup/login/reset, inline feedback |
| UI-03 | Club setup | club name, timezone, optional logo, steps |
| UI-04 | Member approvals | pending members, approve/decline |
| UI-05 | Teams | division, gender category, assigned member count |
| UI-06 | Team detail | roster, coaches, team events |
| UI-07 | Events list | upcoming/past, team filter, RSVP state |
| UI-08 | Event detail | time/venue, capacity, going/maybe/no, waitlist, participant list |
| UI-09 | Create/edit event | title/type/start/end/venue/capacity/deadline, timezone warning |
| UI-10 | Attendance | large touch targets, batch save, summary |
| UI-11 | Notifications | newest-first status changes, read state |
| UI-12 | Settings | language, accessible preferences, profile |

## Interaction rules
- Bottom navigation on phones for frequent player actions; admin tools accessible through clear menu.
- Primary RSVP buttons visible without scrolling on standard phone when practical; two taps or fewer from event card to confirmed response.
- Attendance status buttons large enough for touch, with explicit save confirmation and undo where possible.
- No permission-dependent control merely hidden: backend enforces access even if UI is manipulated.
- Loading skeleton/empty/error/retry/offline states for each feature.
- Consistent labels and translations, e.g. `Vou / Going`, `Talvez / Maybe`, `Não vou / Not going`, `Lista de espera / Waitlist`.

## Accessibility
Use semantic HTML, WCAG 2.2 AA as release target, keyboard traversal and focus visibility, screen-reader status announcements, 44x44 CSS-pixel recommended touch targets unless justified otherwise, appropriate contrast, no color-only statuses, reduced-motion support.

## Design deliverables before coding
1. Sitemap and site navigation model.
2. Low-fidelity wireframes of F01–F04 on phone, tablet and desktop.
3. Design tokens (colors, spacing, type, elevation, breakpoints) and club-level logo/avatar rules.
4. High-fidelity screens with pt-BR and English content (account for text expansion).
5. Clickable prototype and five-user usability test including player + coach + admin tasks.
6. Developer handoff: component variants, states, responsive measurements and accessible labels.

## Brand decision needed
Define 5x1 independent brand mark (not IVI logo), visual palette, typography, iconography. IVI is the tenant/first launch club; 5x1 owns platform-wide interface.

## Court-side direction — approved for wireframe exploration (2026-10-14)
**Design principle:** Frequent tasks should be understandable at a glance, usable with one hand, and resilient to poor connectivity in a sports hall. This is a wireframe brief, not final UI sign-off.

### Design tokens v0.2
| Token | Value | Use |
|---|---|---|
| `navy-900` | `#021C37` | headers, nav, dark surfaces, text on vivid actions |
| `green-500` | `#09CD71` | affirmative primary action, going; navy text |
| `orange-500` | `#FE6D09` | waitlist and attention; navy text |
| `flame-500` | `#F84C04` | destructive/cancelled accent; navy text where solid |
| `canvas` | `#F7F9F6` (provisional) | warm off-white application background |
| `card` | `#FFFFFF` (provisional) | cards |
Colors must be retested on actual text size, hover, disabled, borders and focus rings. Never communicate status by color alone. System sans for body, bold Unicode-capable sans for headings; validate Portuguese diacritics. Spacing multiples of 4 px; 16 px mobile side padding; 12–16 px card padding; 12–16 px gaps; 12–16 px radii. Primary control min-height 48 px; recommended touch area 48–56 CSS px; visible keyboard focus; reduced motion.

### Role-specific navigation
- Player phone bottom nav: `Início / Home`, `Eventos / Events`, `Equipe / Team`, `Perfil / Profile`. Notifications icon in top bar.
- Coach: player essentials plus assigned-team `Presenças / Attendance` and event management; distinct role context.
- Admin: `Visão geral / Overview`, `Equipes / Teams`, `Eventos / Events`, `Membros / Members`, `Mais / More` with approvals, invitations and settings. Bottom tabs on phones; left sidebar on wider screens.
- Expose team context (`name · division · gender`) on every relevant screen; only show switcher when multiple teams are accessible. Role and team context are independent.

### Wireframe 1 — Player Home (mobile-first)
Header: 5x1 wordmark, notifications, profile; own club/team context. Hero card: next event title, local date/time with timezone if ambiguity matters, location, current capacity `9/12`, text + bar. Response row `Vou / Going`, `Talvez / Maybe`, `Não vou / Not going` with clear selected and pending states. Tap should immediately send mutation (no confirmation modal); UI must distinguish optimistic/pending from server-confirmed success, and revert on failure. Below: next 2–3 events, grouped by date. RSVP target <=2 taps, ideal 1.

### Wireframe 2 — Admin overview
Club context; onboarding checklist `Add team`, `Create invitation`, `Schedule event`; pending approvals count and priority queue; next events with team labels; invitation management CTA `Copy invite` (do not print full live token on the dashboard). Empty state for no teams / no events.

### Wireframe 3 — Event detail
Event title, team/club scope, date/timezone, venue and maps, capacity summary. Status group tabs/list `Confirmados / Going`, `Espera / Waitlist`, `Talvez / Maybe`, optionally `Não vão / Not going`; privacy-minimal member names. Ordinary player sees own RSVP controls, cutoff and position when waitlisted. Admin sees reason-recorded promote/remove/reorder override if authorized; default queue order FIFO. When full, `Vou` yields waitlist automatically (not fourth manual choice).

### Wireframe 4 — Attendance
Event/date/team header; progress `11 de 12 marcados`; roster sorted consistently. Each row starts `Não marcado / Unmarked`, changes to `Presente / Present`, `Ausente / Absent`, `Atrasado / Late` through roomy controls; test one-row segmented vs one-tap status picker on 320–390px widths. `Marcar todos presentes / Mark all present` with confirmation/undo and ability to correct. Sticky footer Save with loading, failed-save and success states. No implicit conversion of unmarked to absent. Do not hide controls behind sticky footer or virtual keyboard.

### Interaction state matrix
| State | Player-facing term | Visual | Behavior |
|---|---|---|---|
| Going | Confirmado / Going | green + check | consumes one capacity slot |
| Maybe | Talvez / Maybe | neutral + question | does not consume slot |
| Not going | Não vou / Not going | neutral + X | releases slot |
| Waitlist | Em espera / Waitlisted | orange + clock, position | server-derived from Going when full |
| Cancelled | Cancelado / Cancelled | flame + cancel | RSVP disabled |
| Closed | Inscrições encerradas / RSVP closed | neutral + lock | read-only |
| Pending | Salvando / Saving | spinner/text | no premature success announcement |
| Offline/error | Sem conexão / Connection issue | alert + retry | preserve last server-confirmed state |

### Breakpoints and QA
Design at 320, 360/390, 768 and 1280 px. Verify reach zones while standing, large text zoom, landscape, screen readers, keyboard focus, offline retry, 200% text resize, EN text expansion, daylight-saving time display, very long team/member names. Club crest belongs to tenant context, never global 5x1 identity; use wordmark first. Images are illustrative only, not interactive prototypes.


## Prototype milestone v0.3 — clickable Player Home and Admin Overview
- Deliverable: `prototype/index.html` (dependency-free local interactive prototype).
- Validates primary layout on mobile; pt-BR/English copy switching, light/dark theme, team context, RSVP selected status and admin quick actions.
- Demo states are **not production behavior**. RSVP confirmation and approval counts are simulated; real save semantics require backend acknowledgment.
- Scope boundary: Event Detail, Attendance, sign-in, server persistence, invitations, live waitlist and permissions are not built.
- Gate: perform at least five moderated usability tests with players, coaches and admins; capture mis-taps, time-to-RSVP and missing information before committing wireframes.