-- Step 90: privileged, tightly-scoped event roster read.
-- Deploy only after migration history reconciliation, staging review, and testing.
-- The public entry point is SECURITY INVOKER; the private function has explicit authorization.
create or replace function app_private.event_attendance_roster(p_event_id uuid)
returns table(user_id uuid, display_name text, rsvp_status text)
language plpgsql stable security definer set search_path=''
as $$
declare v_event record;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select id,club_id,team_id into v_event from public.events where id=p_event_id;
  if not found then raise exception 'Event unavailable' using errcode='42501'; end if;
  if not (
    app_private.is_club_admin(v_event.club_id)
    or (v_event.team_id is not null and app_private.is_team_coach(v_event.club_id,v_event.team_id))
  ) then raise exception 'Not authorized for this event roster' using errcode='42501'; end if;

  return query
  select m.user_id,p.display_name,r.status::text
  from public.club_memberships m
  join public.profiles p on p.id=m.user_id
  left join public.rsvps r on r.user_id=m.user_id and r.event_id=v_event.id and r.club_id=v_event.club_id
  where m.club_id=v_event.club_id and m.status='active'
    and ((v_event.team_id is null and exists(
       select 1 from public.club_roles cr where cr.membership_id=m.id and cr.role='player'
    )) or (v_event.team_id is not null and exists(
       select 1 from public.team_memberships tm where tm.membership_id=m.id
         and tm.club_id=v_event.club_id and tm.team_id=v_event.team_id and tm.team_role='player'
    )))
  order by p.display_name,m.user_id;
end;$$;
revoke all on function app_private.event_attendance_roster(uuid) from public,anon;
grant usage on schema app_private to authenticated;
grant execute on function app_private.event_attendance_roster(uuid) to authenticated;

create or replace function public.event_attendance_roster(p_event_id uuid)
returns table(user_id uuid, display_name text, rsvp_status text)
language sql stable security invoker set search_path=''
as $$ select * from app_private.event_attendance_roster(p_event_id); $$;
revoke all on function public.event_attendance_roster(uuid) from public,anon;
grant execute on function public.event_attendance_roster(uuid) to authenticated;
