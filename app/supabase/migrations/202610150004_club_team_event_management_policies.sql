-- Deployed to Supabase project 5x1 as migration 20261015171854.
-- Club bootstrap remains server-only. Protected authenticated management writes.
grant update (name,timezone,logo_path) on public.clubs to authenticated;
create policy "club admin update" on public.clubs for update to authenticated using (app_private.is_club_admin(id)) with check (app_private.is_club_admin(id));
grant insert (club_id,user_id,status), update (status) on public.club_memberships to authenticated;
create policy "club admins add memberships" on public.club_memberships for insert to authenticated
with check (app_private.is_club_admin(club_id) and status in ('pending','active') and user_id <> auth.uid());
create policy "club admins modify memberships" on public.club_memberships for update to authenticated
using (app_private.is_club_admin(club_id)) with check (app_private.is_club_admin(club_id));
grant insert (membership_id,role), delete on public.club_roles to authenticated;
create policy "club admins assign roles" on public.club_roles for insert to authenticated
with check (exists(select 1 from public.club_memberships m where m.id=membership_id and m.status='active' and app_private.is_club_admin(m.club_id)));
create policy "club admins remove roles" on public.club_roles for delete to authenticated
using (exists(select 1 from public.club_memberships m where m.id=membership_id and app_private.is_club_admin(m.club_id)));
grant insert (club_id,name,division,gender), update (name,division,gender), delete on public.teams to authenticated;
create policy "club admins create teams" on public.teams for insert to authenticated with check (app_private.is_club_admin(club_id));
create policy "club admins update teams" on public.teams for update to authenticated
using (app_private.is_club_admin(club_id)) with check (app_private.is_club_admin(club_id));
create policy "club admins delete teams" on public.teams for delete to authenticated using (app_private.is_club_admin(club_id));
grant insert (team_id,club_id,membership_id,team_role), delete on public.team_memberships to authenticated;
create policy "club admins assign teams" on public.team_memberships for insert to authenticated
with check (app_private.is_club_admin(club_id) and exists(select 1 from public.club_memberships m where m.id=membership_id and m.club_id=team_memberships.club_id and m.status='active'));
create policy "club admins remove team assignments" on public.team_memberships for delete to authenticated using (app_private.is_club_admin(club_id));
grant insert (club_id,team_id,title,type,starts_at,ends_at,rsvp_deadline,venue_name,capacity,status,created_by),
update (title,type,starts_at,ends_at,rsvp_deadline,venue_name,capacity,status), delete on public.events to authenticated;
create policy "admins or team coaches create events" on public.events for insert to authenticated
with check (created_by=auth.uid() and (app_private.is_club_admin(club_id) or (team_id is not null and app_private.is_team_coach(club_id,team_id))));
create policy "admins or team coaches update events" on public.events for update to authenticated
using (app_private.is_club_admin(club_id) or (team_id is not null and app_private.is_team_coach(club_id,team_id)))
with check (app_private.is_club_admin(club_id) or (team_id is not null and app_private.is_team_coach(club_id,team_id)));
create policy "admins delete events" on public.events for delete to authenticated using (app_private.is_club_admin(club_id));
