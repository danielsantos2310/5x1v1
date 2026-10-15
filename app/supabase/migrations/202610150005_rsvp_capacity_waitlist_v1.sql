-- Linked Supabase migration 20261015172014
-- Steps 61-63: RSVP decisions, capacity and FIFO waitlist.
grant insert (event_id,club_id,user_id,status), update (status), delete on public.rsvps to authenticated;
create policy "members can RSVP" on public.rsvps for insert to authenticated
with check (user_id=auth.uid() and status in ('going','maybe','not_going') and app_private.is_active_member(club_id)
and exists (select 1 from public.events e where e.id=event_id and e.club_id=rsvps.club_id and e.status='scheduled'
and (e.team_id is null or exists(select 1 from public.team_memberships tm join public.club_memberships m on m.id=tm.membership_id
where tm.team_id=e.team_id and tm.club_id=e.club_id and m.user_id=auth.uid() and m.status='active'))));
create policy "members can change own RSVP" on public.rsvps for update to authenticated
using(user_id=auth.uid() and app_private.is_active_member(club_id))
with check(user_id=auth.uid() and app_private.is_active_member(club_id));
create policy "members can cancel own RSVP" on public.rsvps for delete to authenticated
using (user_id=auth.uid() and app_private.is_active_member(club_id));

create or replace function app_private.enforce_rsvp_capacity()
returns trigger language plpgsql security definer set search_path=''
as $$
declare ev record; going_count bigint;
begin
 if new.status='waitlist' and (tg_op='INSERT' or old.status <> 'waitlist') then
   raise exception 'Waitlist is assigned automatically' using errcode='23514';
 end if;
 select e.id,e.club_id,e.team_id,e.capacity,e.status,e.rsvp_deadline,e.starts_at into ev
 from public.events e where e.id=new.event_id and e.club_id=new.club_id for update;
 if not found then raise exception 'Event does not exist' using errcode='23503';end if;
 if ev.status<>'scheduled' or (ev.rsvp_deadline is not null and clock_timestamp()>ev.rsvp_deadline)
   or clock_timestamp()>ev.starts_at then
   raise exception 'RSVP is closed' using errcode='23514';
 end if;
 if not exists(select 1 from public.club_memberships m where m.club_id=new.club_id and m.user_id=new.user_id and m.status='active') then
   raise exception 'Member is inactive' using errcode='42501';
 end if;
 if ev.team_id is not null and not exists(
   select 1 from public.team_memberships tm join public.club_memberships m on m.id=tm.membership_id
   where tm.team_id=ev.team_id and tm.club_id=ev.club_id and m.user_id=new.user_id and m.status='active') then
   raise exception 'Not a member of the event team' using errcode='42501';
 end if;
 if new.status='going' and ev.capacity is not null then
    select count(*) into going_count from public.rsvps r where r.event_id=new.event_id
      and r.status='going' and (tg_op='INSERT' or r.user_id<>new.user_id);
    if going_count>=ev.capacity then new.status:='waitlist'; end if;
 end if;
 if tg_op='UPDATE' then
    if new.event_id<>old.event_id or new.user_id<>old.user_id or new.club_id<>old.club_id then
      raise exception 'Cannot reassign RSVP identity' using errcode='23514';
    end if;
    new.created_at:=old.created_at;
 end if;
 new.updated_at:=now();
 return new;
end;$$;
revoke all on function app_private.enforce_rsvp_capacity() from public,anon,authenticated;
create trigger trg_enforce_rsvp_capacity before insert or update on public.rsvps
for each row execute function app_private.enforce_rsvp_capacity();

create or replace function app_private.promote_rsvp_waitlist()
returns trigger language plpgsql security definer set search_path=''
as $$
declare target_event uuid; candidate_user uuid;
begin
 if tg_op='DELETE' then
   if old.status<>'going' then return old; end if;
   target_event:=old.event_id;
 else
   if old.status<>'going' or new.status='going' then return new; end if;
   target_event:=new.event_id;
 end if;
 -- Already serialized by BEFORE trigger on updates. For DELETE, acquire event row lock.
 perform 1 from public.events e where e.id=target_event for update;
 select r.user_id into candidate_user
 from public.rsvps r join public.club_memberships m on m.user_id=r.user_id and m.club_id=r.club_id and m.status='active'
 join public.events e on e.id=r.event_id and e.club_id=r.club_id
 where r.event_id=target_event and r.status='waitlist' and e.status='scheduled'
   and (e.rsvp_deadline is null or clock_timestamp()<=e.rsvp_deadline)
   and clock_timestamp()<=e.starts_at
   and (e.team_id is null or exists(select 1 from public.team_memberships tm
         join public.club_memberships mm on mm.id=tm.membership_id
         where tm.team_id=e.team_id and mm.user_id=r.user_id and mm.status='active'))
 order by r.created_at,r.user_id limit 1;
 if candidate_user is not null then
    update public.rsvps set status='going' where event_id=target_event and user_id=candidate_user;
 end if;
 return coalesce(new,old);
end;$$;
revoke all on function app_private.promote_rsvp_waitlist() from public,anon,authenticated;
create trigger trg_promote_rsvp_waitlist after delete or update of status on public.rsvps
for each row execute function app_private.promote_rsvp_waitlist();

