# Step 92 — Security Hardening (2026-10-29)

## Committed
- app/lib/security/validation.ts: reusable runtime checks for UUID, team, event, attendance fields. Database constraints remain the final authority.
- app/lib/supabase/data.ts: validates writes and converts unexpected PostgREST errors to safer client messages. Permission and common constraint errors receive limited, user-friendly text.
- app/app/login/page.tsx and app/app/auth/update-password/page.tsx: stop directly rendering raw auth service errors.
- app/app/auth/confirm/route.ts: accept configured publishable key, with legacy anon-key fallback.
- .github/workflows/codeql.yml: JS/TS static analysis for PRs, main branch and scheduled checks.
- .github/workflows/security-ci.yml: npm ci, typecheck, build, npm audit at high severity.
- .github/dependabot.yml: weekly dependency and GitHub Actions updates.

## Not yet verified
- GitHub Actions result (inspect after push); this commit was made through connected GitHub without local Node runtime testing.
- Actual dependency findings and baseline vulnerability count; npm audit must run.
- Browser auth end-to-end, live roster RPC, or Supabase migration reconciliation.
- Hosted encryption and password hashing algorithm configuration; provider assurance review needed.
- Add security regression tests and comprehensive error telemetry before release.

## Notes
- Browser Supabase keys remain publishable only, no service_role key in client.
- Do not expose raw backend errors to end users; avoid logging PII, auth tokens, or secrets.
- Existing Step 90 roster SQL still NOT applied to the hosted project.
- Never run supabase db push against the linked project without migration reconciliation.
