-- Step 91: run ONLY after Step 90 roster migration on an isolated test database.
-- Read-only authorization smoke test; expected success/denial requires test identities.
-- Function and privilege inventory; does not expose member records.
select n.nspname as schema_name,p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer,
       has_function_privilege('anon',p.oid,'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_can_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where p.proname='event_attendance_roster'
order by n.nspname;
-- Required assertions:
-- public wrapper security_definer=false; anon=false; authenticated=true
-- app_private helper security_definer=true; anon=false; authenticated=true
-- Also verify cross-club/role access with separate Auth JWTs, not SQL editor role spoofing.
