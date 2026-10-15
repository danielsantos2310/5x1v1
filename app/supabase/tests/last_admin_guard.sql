-- Development-only last-admin lockout regression; does not persist any change.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where display_name='5x1 Test Admin'),true);
set local role authenticated;
do $check$
declare blocked_role boolean:=false; blocked_member boolean:=false;
begin
begin
 delete from public.club_roles r using public.club_memberships m, public.clubs c
 where r.membership_id=m.id and m.club_id=c.id and m.user_id=auth.uid()
   and c.name='International Volleyball Ireland' and r.role='admin';
exception when check_violation then blocked_role:=true;
end;
if not blocked_role then raise exception 'FAIL: last admin role removable';end if;
begin
 update public.club_memberships set status='removed'
 where user_id=auth.uid() and club_id=(select id from public.clubs where name='International Volleyball Ireland');
exception when check_violation then blocked_member:=true;
end;
if not blocked_member then raise exception 'FAIL: last admin can be deactivated';end if;
end $check$;
select 'PASS: last administrator cannot be demoted or removed' as result;
rollback;