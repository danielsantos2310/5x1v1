-- Applied to Supabase 5x1 as migration 20261015171141.
-- No direct access for anonymous API role. Least-privilege authenticated access.
revoke all privileges on all tables in schema public from anon, authenticated;
grant select on table public.profiles, public.clubs, public.club_memberships,
  public.club_roles, public.teams, public.team_memberships, public.events,
  public.rsvps, public.attendance_records to authenticated;
grant insert (id, display_name, locale) on public.profiles to authenticated;
grant update (display_name, locale) on public.profiles to authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
