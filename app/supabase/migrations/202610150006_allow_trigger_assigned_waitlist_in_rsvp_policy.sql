-- Linked Supabase migration 20261015172028
drop policy "members can RSVP" on public.rsvps;
create policy "members can RSVP" on public.rsvps for insert to authenticated
with check (user_id=auth.uid() and status in ('going','maybe','not_going','waitlist') and app_private.is_active_member(club_id)
and exists(select 1 from public.events e where e.id=event_id and e.club_id=rsvps.club_id and e.status='scheduled'
and (e.team_id is null or exists(select 1 from public.team_memberships tm
join public.club_memberships m on m.id=tm.membership_id where tm.team_id=e.team_id and m.user_id=auth.uid() and m.status='active'))));
