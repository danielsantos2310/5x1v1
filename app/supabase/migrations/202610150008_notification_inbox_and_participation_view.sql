-- Linked Supabase migration 20261015172316
-- Steps 65-67: durable notification inbox & admin-only participation reports.
create table public.notifications(
 id uuid primary key default gen_random_uuid(),
 club_id uuid not null references public.clubs(id),
 recipient_id uuid not null references public.profiles(id),
 kind text not null check(kind in ('event_created','event_changed','event_cancelled','waitlist_promoted','general')),
 title text not null check(length(trim(title)) between 1 and 160),
 message text not null default '',
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 read_at timestamptz,
 constraint notifications_read_after_create check(read_at is null or read_at>=created_at)
);
create index idx_notifications_recipient_created on public.notifications(recipient_id,created_at desc);
create index idx_notifications_club on public.notifications(club_id);
alter table public.notifications enable row level security;
-- Only trusted service-side code will INSERT notification records.
revoke all on public.notifications from anon,authenticated;
grant select,update(read_at) on public.notifications to authenticated;
create policy "recipient notifications read" on public.notifications for select to authenticated
using(recipient_id=auth.uid() and app_private.is_active_member(club_id));
create policy "recipient notification mark read" on public.notifications for update to authenticated
using(recipient_id=auth.uid() and app_private.is_active_member(club_id))
with check(recipient_id=auth.uid() and app_private.is_active_member(club_id));

create view public.club_event_participation
with (security_invoker=true)
as
select e.id as event_id,e.club_id,e.title,e.type,e.starts_at,e.status,e.capacity,
 count(r.user_id) filter (where r.status='going')::integer as going_count,
 count(r.user_id) filter (where r.status='maybe')::integer as maybe_count,
 count(r.user_id) filter (where r.status='waitlist')::integer as waitlist_count,
 count(a.user_id) filter (where a.status='present')::integer as present_count,
 count(a.user_id) filter (where a.status='late')::integer as late_count,
 count(a.user_id) filter (where a.status='absent')::integer as absent_count
from public.events e
left join public.rsvps r on r.event_id=e.id and r.club_id=e.club_id
left join public.attendance_records a on a.event_id=e.id and a.club_id=e.club_id and a.user_id=r.user_id
where app_private.is_club_admin(e.club_id)
group by e.id,e.club_id,e.title,e.type,e.starts_at,e.status,e.capacity;
revoke all on public.club_event_participation from anon,authenticated;
grant select on public.club_event_participation to authenticated;

