-- 5x1 Step 56: move privileged authorization helpers to an unexposed schema.
-- Applied to linked development project on 2026-10-15.
-- PostgreSQL rewrites existing policy function references when a function changes schema.
-- Keep app_private OUT of the Supabase Data API exposed schemas.
create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;
alter function public.is_active_member(uuid) set schema app_private;
alter function public.is_club_admin(uuid) set schema app_private;
alter function public.is_team_coach(uuid, uuid) set schema app_private;
revoke all on function app_private.is_active_member(uuid),
  app_private.is_club_admin(uuid),
  app_private.is_team_coach(uuid, uuid) from public, anon;
grant execute on function app_private.is_active_member(uuid),
  app_private.is_club_admin(uuid),
  app_private.is_team_coach(uuid, uuid) to authenticated;
comment on schema app_private is
  'Internal authorization helpers; do not expose this schema through PostgREST API settings.';
-- Validation: authenticated simulated IVI administrator sees IVI, true/true.
-- Security advisor: the three publicly exposed security-definer warnings resolved.
-- Remaining unrelated auth warning: leaked-password protection disabled.
