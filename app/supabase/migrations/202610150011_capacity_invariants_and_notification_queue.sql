-- Linked Supabase migration 20261015172650
-- Steps 62/66: prevent capacity reductions below confirmed RSVPs and queue inbox notices.
create or replace function app_private.validate_event_capacity()
returns trigger language plpgsql security definer set search_path=''
as $$
declare already_going bigint;
begin
 if new.capacity is not null and
    (old.capacity is distinct from new.capacity or old.status is distinct from new.status) then
   select count(*) into already_going from public.rsvps r
     where r.event_id=new.id and r.status='going';
   if already_going>new.capacity then
     raise exception 'Capacity cannot be less than confirmed RSVPs' using errcode='23514';
   end if;
 end if;
 return new;
end;$$;
revoke all on function app_private.validate_event_capacity() from public,anon,authenticated;
create trigger trg_validate_event_capacity before update of capacity,status on public.events
for each row execute function app_private.validate_event_capacity();

create or replace function app_private.queue_event_created_notification()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
 if new.status='scheduled' then
   insert into public.notifications(club_id,recipient_id,kind,title,message,payload)
   select new.club_id,m.user_id,'event_created',new.title,
     'A new club event has been scheduled.',
     jsonb_build_object('event_id',new.id,'starts_at',new.starts_at)
   from public.club_memberships m
   where m.club_id=new.club_id and m.status='active'
      and (new.team_id is null or exists(
       select 1 from public.team_memberships tm where tm.club_id=new.club_id
        and tm.team_id=new.team_id and tm.membership_id=m.id));
 end if;
 return new;
end;$$;
revoke all on function app_private.queue_event_created_notification() from public,anon,authenticated;
create trigger trg_queue_event_created after insert on public.events
for each row execute function app_private.queue_event_created_notification();

create or replace function app_private.queue_waitlist_promotion_notice()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
 if old.status='waitlist' and new.status='going' then
   insert into public.notifications(club_id,recipient_id,kind,title,message,payload)
   select new.club_id,new.user_id,'waitlist_promoted',e.title,
     'A place is now available for your event.',
     jsonb_build_object('event_id',e.id)
   from public.events e where e.id=new.event_id and e.club_id=new.club_id;
 end if;
 return new;
end;$$;
revoke all on function app_private.queue_waitlist_promotion_notice() from public,anon,authenticated;
create trigger trg_queue_waitlist_promotion_notice after update of status on public.rsvps
for each row execute function app_private.queue_waitlist_promotion_notice();

