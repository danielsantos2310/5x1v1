-- DEVELOPMENT ONLY: test coach/player permissions with rollback-only Auth fixtures.
begin;
insert into auth.users(id,aud,role,email) values
(gen_random_uuid(),'authenticated','authenticated','5x1-role-coach@example.invalid'),
(gen_random_uuid(),'authenticated','authenticated','5x1-role-player@example.invalid');
insert into public.profiles(id,display_name) select id,case when email like '%coach%' then 'TEMP COACH' else 'TEMP PLAYER' end
from auth.users where email like '5x1-role-%@example.invalid';
insert into public.club_memberships(club_id,user_id,status)
select c.id,p.id,'active' from public.clubs c cross join public.profiles p
where c.name='International Volleyball Ireland' and p.display_name in ('TEMP COACH','TEMP PLAYER');
insert into public.club_roles(membership_id,role)
select m.id,case when p.display_name='TEMP COACH' then 'coach' else 'player' end
from public.club_memberships m join public.profiles p on p.id=m.user_id where p.display_name in ('TEMP COACH','TEMP PLAYER');
insert into public.teams(club_id,name,division,gender) select id,'TEMP COACHED TEAM','D4','mixed'
from public.clubs where name='International Volleyball Ireland';
insert into public.team_memberships(team_id,club_id,membership_id,team_role)
select t.id,t.club_id,m.id,case when p.display_name='TEMP COACH' then 'coach' else 'player' end
from public.teams t join public.club_memberships m on m.club_id=t.club_id join public.profiles p on p.id=m.user_id
where t.name='TEMP COACHED TEAM' and p.display_name in ('TEMP COACH','TEMP PLAYER');
select set_config('test.coach',(select id::text from public.profiles where display_name='TEMP COACH'),true);
select set_config('test.player',(select id::text from public.profiles where display_name='TEMP PLAYER'),true);
select set_config('request.jwt.claim.sub',current_setting('test.coach'),true);
set local role authenticated;
insert into public.events(club_id,team_id,title,type,starts_at,ends_at,created_by)
select club_id,id,'TEMP COACH EVENT','training',now()+interval '1 day',now()+interval '2 days',auth.uid()
from public.teams where name='TEMP COACHED TEAM';
do $checks$ declare blocked boolean:=false; rows_affected integer;
begin
begin
insert into public.events(club_id,title,type,starts_at,ends_at,created_by)
select club_id,'TEMP CLUB EVENT','training',now()+interval '1 day',now()+interval '2 days',auth.uid()
from public.teams where name='TEMP COACHED TEAM';
exception when insufficient_privilege then blocked:=true;end;
if not blocked then raise exception 'coach must not create clubwide event';end if;
update public.clubs set timezone='UTC' where name='International Volleyball Ireland';
get diagnostics rows_affected=row_count;
if rows_affected<>0 then raise exception 'coach modified club settings';end if;
end $checks$;
insert into public.attendance_records(event_id,club_id,user_id,status,marked_by)
select id,club_id,current_setting('test.player')::uuid,'present',auth.uid()
from public.events where title='TEMP COACH EVENT';
select set_config('request.jwt.claim.sub',current_setting('test.player'),true);
do $checks$ declare blocked boolean:=false; rows_seen integer;
begin
begin
insert into public.events(club_id,team_id,title,type,starts_at,ends_at,created_by)
select club_id,id,'TEMP ILLEGAL PLAYER EVENT','training',now()+interval '1 day',now()+interval '2 days',auth.uid()
from public.teams where name='TEMP COACHED TEAM';
exception when insufficient_privilege then blocked:=true;end;
if not blocked then raise exception 'player created event';end if;
blocked:=false;
begin
insert into public.attendance_records(event_id,club_id,user_id,status,marked_by)
select id,club_id,auth.uid(),'absent',auth.uid() from public.events where title='TEMP COACH EVENT';
exception when insufficient_privilege then blocked:=true;end;
if not blocked then raise exception 'player marked attendance';end if;
select count(*) into rows_seen from public.attendance_records a join public.events e on e.id=a.event_id
where e.title='TEMP COACH EVENT' and a.user_id=auth.uid() and a.status='present';
if rows_seen<>1 then raise exception 'player cannot read own attendance';end if;
end $checks$;
select 'PASS: coach team event and player attendance; coach cannot create club event/edit club; player cannot create event/mark attendance; player sees own attendance' as result;
rollback;