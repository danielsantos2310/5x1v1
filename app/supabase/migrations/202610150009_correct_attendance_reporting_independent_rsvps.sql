-- Linked Supabase migration 20261015172328
create or replace view public.club_event_participation
with (security_invoker=true)
as
select e.id as event_id,e.club_id,e.title,e.type,e.starts_at,e.status,e.capacity,
 coalesce(r.going_count,0)::integer going_count,
 coalesce(r.maybe_count,0)::integer maybe_count,
 coalesce(r.waitlist_count,0)::integer waitlist_count,
 coalesce(a.present_count,0)::integer present_count,
 coalesce(a.late_count,0)::integer late_count,
 coalesce(a.absent_count,0)::integer absent_count
from public.events e
left join lateral (
 select count(*) filter (where status='going') going_count,
 count(*) filter (where status='maybe') maybe_count,
 count(*) filter (where status='waitlist') waitlist_count
 from public.rsvps x where x.event_id=e.id and x.club_id=e.club_id
) r on true
left join lateral (
 select count(*) filter (where status='present') present_count,
 count(*) filter (where status='late') late_count,
 count(*) filter (where status='absent') absent_count
 from public.attendance_records x where x.event_id=e.id and x.club_id=e.club_id
) a on true
where app_private.is_club_admin(e.club_id);
