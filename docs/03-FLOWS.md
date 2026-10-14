# FLOWS — User and System Flows
Version 0.1

## Flow F01 — Club creation
1. New user chooses pt-BR or en, signs up and verifies email if enabled.
2. User chooses `Criar clube / Create club`.
3. Enters club name, IANA timezone, optional image; validates.
4. Server creates club and active admin membership transactionally.
5. User sees setup checklist: add team, create invitation, schedule first event.
6. Record event for analytic success timer (start on authenticated setup; finish when first event is saved).
**Errors:** duplicate name allowed across clubs; malformed image, permission failure, network failure, interrupted submission are handled. Prevent duplicate creation from repeated clicks.

## Flow F02 — Join and roster
1. Admin generates expiring/revocable invite link (token securely hashed at rest).
2. Player opens token -> login/signup -> token validated -> membership request created or permitted instant join.
3. Admin reviews pending members and approves/declines.
4. Admin assigns one or more teams (division/gender category are team properties, not user properties).
5. Player sees own team roster and relevant events.
**Errors:** expired/revoked invite, duplicate membership, club mismatch, unauthorized approval; do not reveal unnecessary existing-account details.

## Flow F03 — Events and RSVP
1. Authorized coach selects assigned team (or admin selects team/club-wide), enters title/type/date/start/end/venue/capacity/deadline.
2. Server verifies permission, timezone date ordering and event constraints.
3. Members in scope see event and respond Going / Not going / Maybe.
4. Server serializes concurrent updates and computes capacity.
5. If going slots remain: status `going`; else `waitlist` (if requested Going); `maybe` does not reserve a spot (proposed).
6. When Going cancels before cutoff, earliest eligible waitlisted user is promoted atomically and notified.
7. On edits/cancellation, notifications generated to affected users.
**Errors:** deadline passed, cancelled event, offline action, two members selecting last slot, contradictory status revisions.

```mermaid
flowchart TD
 A[Open event] --> B{Before deadline and scheduled?}
 B -- No --> X[Read only: explain]
 B -- Yes --> C[Choose going / maybe / not going]
 C --> D{Going requested?}
 D -- No --> E[Save chosen state]
 D -- Yes --> F{Space available?}
 F -- Yes --> G[Confirm going]
 F -- No --> H[Add to waitlist]
 E --> I[Commit and broadcast]
 G --> I
 H --> I
```

## Flow F04 — Attendance
1. Admin or assigned coach opens event's attendance tab.
2. Server returns relevant team roster and RSVP status.
3. Operator marks Present / Absent / Late; includes manually added attending member if allowed.
4. Operator saves batch; backend verifies role and records operator/time.
5. Operator reviews summary and can correct with audit trail.
**Errors:** unauthorized team, event cancelled, simultaneous edits, accidental marking, offline state.

## Flow F05 — Language
1. Default anonymous locale pt-BR.
2. User can switch to en on all screens including before signup.
3. Save preference to profile after signup; honor preference on later devices.
4. Translate date/number labels using selected locale; use club timezone for event clock.

## Permission outline
| Action | Club admin | Assigned team coach | Player |
| --- | --- | --- | --- |
| Create/edit club and teams | Yes | No | No |
| Approve member, grant roles | Yes | No | No |
| View assigned roster | Yes | Yes | Own team (limited fields) |
| Create/edit team event | Yes | Assigned team | No |
| RSVP to eligible event | Yes if participant | Yes if participant | Yes |
| Mark attendance | Yes | Assigned team | No |
| See other club data | Never without membership | Never | Never |

## Special cases to test
A coach who is also player; member of two clubs; player on two teams; shared club-wide social event; removed member still linked to historical attendance; user with stale invite; DST boundary in Europe/Dublin; last RSVP spot race; waitlist cancellation; no network.

## Court-side interaction refinements — 2026-10-14
### F03a — One-tap RSVP from Home
1. Player sees next applicable event with team context and response options.
2. Tapping `Vou`, `Talvez` or `Não vou` immediately shows a pending state; disable duplicate requests while one is in flight.
3. Server verifies membership, authorization, deadline, event state and capacity atomically.
4. Success response includes canonical status and, if waitlisted, queue position; announce status in localized accessible text.
5. On network rejection/error, revert to last confirmed state, display short error and retry action; never show unverified success.
6. Revisions allowed until RSVP cutoff. On slot release, promote earliest eligible waitlisted entry in transaction, notify impacted member.
### F03b — Admin waitlist override
Authorized admin chooses member and action, sees impact on capacity, supplies reason, confirms; server logs actor, timestamps, before/after states and reason and broadcasts canonical list. Override cannot silently exceed capacity.
### F04a — Attendance fast path
1. Coach opens assigned event and sees all expected members as unmarked unless previously recorded.
2. Optionally selects `Mark all present`, then corrects absences and late arrivals.
3. Sticky footer displays `marked / expected` and save CTA. Save writes only explicit statuses, never defaults unmarked to absent.
4. Backend validates actor's assignment and persists with audit log, returning success/failure; failed saves preserve edited local state for retry without claiming persistence.
### F05 — Multiple teams
When user belongs to >1 applicable team, context switcher lists team name, division and gender. Selected context filters events and roster; choosing another team never grants new access. With one team, show static team label.
### F06 — Invitation safety
Admin overview exposes `Manage invitations` / `Copy invite`, not full URL token by default. Copy requires active valid invitation; admin can inspect expiry, revoke or regenerate. Joining still follows existing approval policy.