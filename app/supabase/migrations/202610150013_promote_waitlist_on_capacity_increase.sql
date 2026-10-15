-- Linked Supabase migration 20261015172933
-- Preserve FIFO ordering when extra capacity becomes available.
create or replace function app_private.promote_waitlist_on_capacity_increase()
returns trigger language plpgsql security definer set search_path=''
as $$
declare next_user uuid; going_now bigint;
begin
 if new.status<>'scheduled' or new.capacity is null
   or (old.capacity is not distinct from new.capacity)
   or (old.capacity is not null and new.capacity<=old.capacity)
   or (new.rsvp_deadline is not null and clock_timestamp()>new.rsvp_deadline)
   or clock_timestamp()>new.starts_at then
   return new;
 end if;
 loop
   select count(*) into going_now from public.rsvps r
    where r.event_id=new.id and r.status='going';
   exit when going_now>=new.capacity;
   select r.user_id into next_user
   from public.rsvps r
   join public.club_memberships m on m.club_id=r.club_id and m.user_id=r.user_id and m.status='active'
   where r.event_id=new.id and r.status='waitlist'
      and (new.team_id is null or exists(select 1 from public.team_memberships tm
          where tm.team_id=new.team_id and tm.club_id=new.club_id and tm.membership_id=m.id))
   order by r.created_at,r.user_id
   limit 1;
   exit when next_user is null;
   update public.rsvps set status='going' where event_id=new.id and user_id=next_user;
 end loop;
 return new;
end;$$;
revoke all on function app_private.promote_waitlist_on_capacity_increase() from public,anon,authenticated;
create trigger trg_promote_on_capacity_increase after update of capacity on public.events
for each row execute function app_private.promote_waitlist_on_capacity_increase();

