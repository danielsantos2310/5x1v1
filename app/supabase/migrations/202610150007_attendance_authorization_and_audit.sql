-- Linked Supabase migration 20261015172251
-- Step 64: club admin and assigned coach attendance management.
drop policy "attendance own or admin read" on public.attendance_records;
create policy "attendance own admin coach read" on public.attendance_records for select to authenticated
using (app_private.is_active_member(club_id) and (
 user_id=auth.uid() or app_private.is_club_admin(club_id)
 or exists(select 1 from public.events e where e.id=event_id and e.club_id=attendance_records.club_id
 and e.team_id is not null and app_private.is_team_coach(e.club_id,e.team_id))
));
grant insert (event_id,club_id,user_id,status,marked_by), update (status,marked_by,marked_at), delete
on public.attendance_records to authenticated;
create policy "attendance authorized insert" on public.attendance_records for insert to authenticated
with check (
 marked_by=auth.uid() and app_private.is_active_member(club_id)
 and exists(select 1 from public.club_memberships m where m.club_id=attendance_records.club_id and m.user_id=attendance_records.user_id and m.status='active')
 and exists(select 1 from public.events e where e.id=event_id and e.club_id=attendance_records.club_id
 and (app_private.is_club_admin(e.club_id) or (e.team_id is not null and app_private.is_team_coach(e.club_id,e.team_id)))
 and (e.team_id is null or exists(select 1 from public.team_memberships tm
   join public.club_memberships cm on cm.id=tm.membership_id
   where tm.team_id=e.team_id and tm.club_id=e.club_id and cm.user_id=attendance_records.user_id and cm.status='active')))
);
create policy "attendance authorized update" on public.attendance_records for update to authenticated
using (exists (select 1 from public.events e where e.id=event_id and e.club_id=attendance_records.club_id
  and (app_private.is_club_admin(e.club_id) or (e.team_id is not null and app_private.is_team_coach(e.club_id,e.team_id)))))
with check (marked_by=auth.uid() and app_private.is_active_member(club_id)
 and exists(select 1 from public.events e where e.id=event_id and e.club_id=attendance_records.club_id
 and (app_private.is_club_admin(e.club_id) or (e.team_id is not null and app_private.is_team_coach(e.club_id,e.team_id)))));
create policy "attendance authorized delete" on public.attendance_records for delete to authenticated
using (app_private.is_club_admin(club_id));
create or replace function app_private.stamp_attendance_update()
returns trigger language plpgsql set search_path='' as $$
begin
 new.marked_by:=auth.uid();
 new.marked_at:=now();
 return new;
end;$$;
revoke all on function app_private.stamp_attendance_update() from public,anon,authenticated;
create trigger trg_stamp_attendance_update before update on public.attendance_records
for each row execute function app_private.stamp_attendance_update();

