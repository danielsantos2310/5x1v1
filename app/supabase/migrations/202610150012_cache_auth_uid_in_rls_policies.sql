-- Linked Supabase migration 20261015172731
do $migration$
declare p record; qualifier text; checker text; stmt text;
begin
 for p in select tablename,policyname,qual,with_check
 from pg_policies
 where schemaname='public' and policyname in
 ('club admins add memberships','members can RSVP','members can cancel own RSVP',
 'members can change own RSVP','attendance authorized insert','attendance authorized update',
 'attendance own admin coach read','admins or team coaches create events',
 'recipient notification mark read','recipient notifications read')
 loop
   qualifier:=replace(p.qual,'auth.uid()','(select auth.uid())');
   checker:=replace(p.with_check,'auth.uid()','(select auth.uid())');
   stmt:=format('alter policy %I on public.%I',p.policyname,p.tablename);
   if qualifier is not null then stmt:=stmt||' using ('||qualifier||')';end if;
   if checker is not null then stmt:=stmt||' with check ('||checker||')';end if;
   execute stmt;
 end loop;
end $migration$;
