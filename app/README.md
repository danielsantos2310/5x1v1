# 5x1 Next.js foundation (prototype shell)

This is an **unreleased scaffold**, not the validated production app. A separate legacy four-screen prototype remains at [../prototype/index.html](../prototype/index.html).

## Start locally
1. Install Node.js (modern LTS release compatible with Next.js 15).
2. From this folder run `npm install`.
3. Run `npm run dev`; open `http://localhost:3000`.
4. Run `npm run typecheck` and `npm run build` before PRs.

## Included
- Next.js App Router + TypeScript.
- Responsive Player Home / Admin Overview demonstration.
- Portuguese (Brazil) and English strings; light/dark state.
- Local-only RSVP demonstration — **no persisted data**.

## Explicitly not implemented
- Server authentication, database, Supabase, server-backed RSVP, role authorization, protected routes, accessibility/usability test sign-off, true i18n routing, PWA service worker/manifest, final vector brand assets. Never import real members into this scaffold.

## Next step
Perform the usability validation described in [../docs/09-PROTOTYPE-VALIDATION.md](../docs/09-PROTOTYPE-VALIDATION.md), then implement i18n routing, accessibility QA, security-approved Supabase schema/RLS and tests in separate reviewed changes.

## Authentication foundation (requires configuration)
Sign up/sign in/password reset pages and the first deny-by-default multi-club migration are now committed. They are NOT deployed or verified with a real Supabase project. Follow [supabase/README.md](supabase/README.md), then independently test email confirmation and recovery sessions. Do not enable real RSVP writes until RPC transaction and RLS tests are implemented.
