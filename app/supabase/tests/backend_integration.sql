-- 5x1 backend integration regression. DEVELOPMENT PROJECT ONLY.
-- All temporary auth identities and application fixtures are discarded with ROLLBACK.
begin;
insert into auth.users(id,aud,role,email) values
 (gen_random_uuid(),'authenticated','authenticated','5x1-rollback-player-a@example.invalid'),
 (gen_random_uuid(),'authenticated','authenticated','5x1-rollback-player-b@example.invalid');
insert into public.profiles(id,display_name) select id,
 case when email like '%-a@%' then 'ROLLBACK PLAYER A' else 'ROLLBACK PLAYER B' end
 from auth.users where email like '5x1-rollback-player-%@example.invalid';
insert into public.club_memberships(club_id,user_id,status)
select c.id,p.id,'active' from public.clubs c cross join public.profiles p
where c.name='International Volleyball Ireland'
and p.display_name in ('ROLLBACK PLAYER A','ROLLBACK PLAYER B');
insert into public.events(club_id,title,type,starts_at,ends_at,capacity,created_by)
select id,'5x1 ROLLBACK INTEGRATION EVENT','training',now()+interval '1 day',
now()+interval '2 days',2,created_by from public.clubs where name='International Volleyball Ireland';
select set_config('test.admin',(select id::text from public.profiles where display_name='5x1 Test Admin'),true);
select set_config('test.a',(select id::text from public.profiles where display_name='ROLLBACK PLAYER A'),true);
select set_config('test.b',(select id::text from public.profiles where display_name='ROLLBACK PLAYER B'),true);
select set_config('request.jwt.claim.sub',current_setting('test.admin'),true);
set local role authenticated;
insert into public.rsvps(event_id,club_id,user_id,status)
select id,club_id,auth.uid(),'going' from public.events where title='5x1 ROLLBACK INTEGRATION EVENT';
select set_config('request.jwt.claim.sub',current_setting('test.a'),true);
insert into public.rsvps(event_id,club_id,user_id,status)
select id,club_id,auth.uid(),'going' from public.events where title='5x1 ROLLBACK INTEGRATION EVENT';
select set_config('request.jwt.claim.sub',current_setting('test.b'),true);
insert into public.rsvps(event_id,club_id,user_id,status)
select id,club_id,auth.uid(),'going' from public.events where title='5x1 ROLLBACK INTEGRATION EVENT';
select set_config('request.jwt.claim.sub',current_setting('test.admin'),true);
do $check$
declare e uuid; count_rows int; failed boolean:=false;
begin
select id into e from public.events where title='5x1 ROLLBACK INTEGRATION EVENT';
select count(*) into count_rows from public.club_event_participation where event_id=e and going_count=2 and waitlist_count=1;
if count_rows<>1 then raise exception 'FAIL: RLS aggregate/count or waitlist';end if;
begin
 update public.events set capacity=1 where id=e;
 exception when check_violation then failed:=true;
end;
if not failed then raise exception 'FAIL: accepted capacity smaller than confirmed count';end if;
end $check$;
update public.rsvps set status='not_going'
where user_id=auth.uid() and event_id=(select id from public.events where title='5x1 ROLLBACK INTEGRATION EVENT');
update public.events set status='cancelled' where title='5x1 ROLLBACK INTEGRATION EVENT';
select set_config('request.jwt.claim.sub',current_setting('test.b'),true);
do $check$
declare ev uuid; x integer;
begin
select id into ev from public.events where title='5x1 ROLLBACK INTEGRATION EVENT';
select count(*) into x from public.rsvps where event_id=ev and user_id=auth.uid() and status='going';
if x<>1 then raise exception 'FAIL: waitlist promotion';end if;
select count(*) into x from public.notifications where recipient_id=auth.uid() and kind in ('event_created','waitlist_promoted','event_cancelled');
if x<>3 then raise exception 'FAIL: missing notification, found %',x;end if;
end $check$;
select 'PASS: 3-user RSVP, waitlist, automatic promotion, cap decrease rejection, cancellation notifications, RLS' as result;
rollback;
