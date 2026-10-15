-- Linked Supabase migration 20261015173420
-- Fix coach attendance: membership/roster lookups must not rely on the caller's RLS-visible roster.
create or replace function app_private.is_active_club_user(p_club uuid,p_user uuid)
returns boolean language sql stable security definer set search_path=''
as $$
select (select auth.uid()) is not null and exists(
 select 1 from public.club_memberships m
 where m.club_id=p_club and m.user_id=p_user and m.status='active');
$$;
create or replace function app_private.is_active_team_user(p_club uuid,p_team uuid,p_user uuid)
returns boolean language sql stable security definer set search_path=''
as $$
select (select auth.uid()) is not null and exists(
 select 1 from public.club_memberships m
 join public.team_memberships tm on tm.membership_id=m.id and tm.club_id=m.club_id
 where m.club_id=p_club and m.user_id=p_user and m.status='active'
   and tm.team_id=p_team);
$$;
revoke all on function app_private.is_active_club_user(uuid,uuid),
 app_private.is_active_team_user(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function app_private.is_active_club_user(uuid,uuid),
 app_private.is_active_team_user(uuid,uuid,uuid) to authenticated;
drop policy "attendance authorized insert" on public.attendance_records;
create policy "attendance authorized insert" on public.attendance_records
for insert to authenticated with check(
 marked_by=(select auth.uid())
 and app_private.is_active_member(club_id)
 and app_private.is_active_club_user(club_id,user_id)
 and exists(select 1 from public.events e
  where e.id=event_id and e.club_id=attendance_records.club_id
   and (app_private.is_club_admin(e.club_id)
       or (e.team_id is not null and app_private.is_team_coach(e.club_id,e.team_id)))
   and (e.team_id is null
       or app_private.is_active_team_user(e.club_id,e.team_id,attendance_records.user_id)))
);

