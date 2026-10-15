-- Linked Supabase migration 20261015173035
-- Step 66: event update/cancellation notification inbox records.
create or replace function app_private.queue_event_update_notice()
returns trigger language plpgsql security definer set search_path=''
as $$
declare notification_kind text; notification_message text;
begin
 if new.status='cancelled' and old.status<>'cancelled' then
   notification_kind:='event_cancelled';
   notification_message:='This club event has been cancelled.';
 elsif (new.title,new.starts_at,new.ends_at,new.venue_name,new.status)
   is distinct from (old.title,old.starts_at,old.ends_at,old.venue_name,old.status)
   and new.status='scheduled' then
   notification_kind:='event_changed';
   notification_message:='A club event has been updated.';
 else
   return new;
 end if;
 insert into public.notifications(club_id,recipient_id,kind,title,message,payload)
 select new.club_id,m.user_id,notification_kind,new.title,notification_message,
   jsonb_build_object('event_id',new.id,'starts_at',new.starts_at)
 from public.club_memberships m
 where m.club_id=new.club_id and m.status='active'
   and (new.team_id is null or exists(
      select 1 from public.team_memberships tm where tm.club_id=new.club_id
       and tm.team_id=new.team_id and tm.membership_id=m.id));
 return new;
end;$$;
revoke all on function app_private.queue_event_update_notice() from public,anon,authenticated;
create trigger trg_queue_event_update_notice after update of title,starts_at,ends_at,venue_name,status on public.events
for each row execute function app_private.queue_event_update_notice();
