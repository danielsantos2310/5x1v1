-- Linked Supabase migration 20261015173614
-- Never allow removal of the last active club administrator.
create or replace function app_private.guard_last_active_admin_role()
returns trigger language plpgsql security definer set search_path=''
as $$
declare owner_club uuid; owner_member uuid; alternative_count bigint;
begin
 if old.role<>'admin' then return old; end if;
 select m.club_id,m.id into owner_club,owner_member
 from public.club_memberships m where m.id=old.membership_id and m.status='active';
 if owner_club is null then return old;end if;
 perform 1 from public.clubs c where c.id=owner_club for update;
 select count(*) into alternative_count from public.club_memberships m
 join public.club_roles r on r.membership_id=m.id
 where m.club_id=owner_club and m.status='active' and r.role='admin'
 and m.id<>owner_member;
 if alternative_count=0 then
  raise exception 'Cannot remove the last active administrator role' using errcode='23514';
 end if;
 return old;
end;$$;
create or replace function app_private.guard_last_active_admin_membership()
returns trigger language plpgsql security definer set search_path=''
as $$
declare other_count bigint;
begin
 if old.status<>'active' or new.status='active' then return new; end if;
 if not exists(select 1 from public.club_roles r
               where r.membership_id=old.id and r.role='admin') then return new;end if;
 perform 1 from public.clubs c where c.id=old.club_id for update;
 select count(*) into other_count from public.club_memberships m
 join public.club_roles r on r.membership_id=m.id
 where m.club_id=old.club_id and m.id<>old.id and m.status='active' and r.role='admin';
 if other_count=0 then
   raise exception 'Cannot deactivate the last active administrator' using errcode='23514';
 end if;
 return new;
end;$$;
revoke all on function app_private.guard_last_active_admin_role(),
app_private.guard_last_active_admin_membership() from public,anon,authenticated;
create trigger trg_guard_last_admin_role before delete on public.club_roles
for each row execute function app_private.guard_last_active_admin_role();
create trigger trg_guard_last_admin_membership before update of status on public.club_memberships
for each row execute function app_private.guard_last_active_admin_membership();

