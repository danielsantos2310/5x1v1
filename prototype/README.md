# 5x1 Court-Side · Clickable prototype v0.3

Open `index.html` in Chrome, Edge, Firefox or Safari. No install, account, credentials or server is required.

## Included
- Player Home and Admin Overview, responsive to mobile and desktop viewports.
- Light/dark theme and pt-BR/English switch.
- Player team selector and immediate RSVP selection, with explicit demo confirmation.
- Admin pending-approval count, setup checklist, invite demo and event-creation demo.
- Keyboard focus, semantic buttons, status live region, 48px+ tap controls, reduced-motion support.

## Deliberately simulated
No Supabase integration, authentication, persistence, real event scheduling, real invites, live capacity/waitlist or attendance. The controls use in-page demo state. Example dates and club counts are placeholders, not verified club records.

## Testing tasks
1. On a 360-390px phone viewport, switch player team and RSVP Going in one tap.
2. Change to Maybe; verify the state and feedback. Switch to EN and dark mode.
3. Switch to Admin, review approvals, approve one demo request, inspect checklist.
4. Simulate first event and verify the checklist counter advances to 3/3.
5. Tab through controls with keyboard; test 200% zoom and screen reader announcement.

## Next
Design Event Detail and Attendance, then validate end-to-end flows and state contracts before frontend/backend implementation.