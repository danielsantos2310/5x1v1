-- 5x1 security regression tests. Run in SQL Editor against *development only*.
-- Transaction scopes temporary membership-state mutations, rollback restores everything.
-- Uses development seed display_name "5x1 Test Admin"; use a fixed UUID in CI.
-- 1. Verify current IVI scope
begin;
select set_config('request.jwt.claim.sub',
  (select id::text from public.profiles where display_name='5x1 Test Admin' limit 1),true);
set local role authenticated;
select name, app_private.is_active_member(id) as active_member,
 app_private.is_club_admin(id) as club_admin from public.clubs;
rollback;
-- 2. A user without membership sees no rows
begin;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
set local role authenticated;
select (select count(*) from public.profiles) as visible_profiles,
 (select count(*) from public.clubs) as visible_clubs,
 (select count(*) from public.club_memberships) as visible_memberships;
rollback;
-- 3. Check API role privileges without changing data
select c.relname as table_name,
 has_table_privilege('anon',c.oid,'SELECT') as anonymous_read,
 has_table_privilege('anon',c.oid,'TRUNCATE') as anonymous_truncate,
 has_table_privilege('authenticated',c.oid,'TRUNCATE') as authenticated_truncate
from pg_class c join pg_namespace n on c.relnamespace=n.oid
where n.nspname='public' and c.relkind='r'
order by c.relname;
-- 4. Revocation test, completed in Supabase on 2026-10-15:
-- UPDATE club_memberships status to removed in BEGIN, simulate authenticated user,
-- verify is_active_member=false, is_club_admin=false, and clubs count=0; ROLLBACK.
-- 5. Invalid event end time, invalid team gender and unsupported club role:
-- verified CHECK violations in a rolled-back transaction on 2026-10-15.
