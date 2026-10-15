-- Linked Supabase migration 20261015172434
create policy "rsvp club admin or team coach read" on public.rsvps
for select to authenticated using(
 app_private.is_active_member(club_id) and exists(
   select 1 from public.events e where e.id=rsvps.event_id and e.club_id=rsvps.club_id and
   (app_private.is_club_admin(e.club_id) or
   (e.team_id is not null and app_private.is_team_coach(e.club_id,e.team_id)))
 )
);
