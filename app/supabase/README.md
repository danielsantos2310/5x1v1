# 5x1 Supabase setup — not deployed

1. Review GDPR/UK GDPR/LGPD hosting and data transfer requirements; choose a suitable Supabase project region before putting any real data in it.
2. Create a new Supabase project and enable email/password authentication. Set Site URL and allowed redirect URLs, including `http://localhost:3000/auth/confirm` for local dev.
3. Copy `../.env.example` to `../.env.local`, filling in the project URL and the publishable/anon key. **Never commit secrets or service-role keys**.
4. Apply migration `migrations/202610140001_foundation.sql` using Supabase CLI against a throwaway test project first, or run in SQL editor after review.
5. Run RLS and cross-club authorization tests before enabling any writes. The migration intentionally offers no user-facing club/event/RSVP write policies. Club creation must be a reviewed transactional function.
6. Test sign up, email confirmation, login and password reset, including production email templates. Confirmation link templates should use `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` and an allowed redirect.
7. Password recovery redirects to `/auth/update-password`; verify session cookie/PKCE handling against your Supabase version before launch. No production sessions or data must be assumed safe without browser tests.

**Important:** club creation, invitations, event mutation, server-authoritative RSVP capacity, waitlist promotion and attendance saving are intentionally unimplemented. `app/app/page.tsx` remains demo-only. There is no production data live in this repository.
