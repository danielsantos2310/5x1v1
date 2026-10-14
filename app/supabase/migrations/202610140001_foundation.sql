-- 5x1 Foundation migration v0.1
-- Run in a dedicated Supabase project after selecting and verifying the legal hosting region.
-- Server-side RSVP capacity/waitlist logic is intentionally NOT exposed yet.
create extension if not exists pgcrypto;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  locale text not null default 'pt-BR' check (locale in ('pt-BR','en')),
  created_at timestamptz not null default now()
);
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  timezone text not null default 'Europe/Dublin',
  logo_path text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  user_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending','active','removed')),
  created_at timestamptz not null default now(),
  unique(club_id,user_id),
  unique(id,club_id)
);
create table public.club_roles (
  membership_id uuid not null references public.club_memberships(id) on delete cascade,
  role text not null check(role in ('admin','coach','player')),
  primary key(membership_id,role)
);
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  name text not null check(length(trim(name))>0),
  division text not null check(length(trim(division))>0),
  gender text not null check(gender in ('men','women','mixed')),
  created_at timestamptz not null default now(),
  unique(id,club_id)
);
create table public.team_memberships (
  team_id uuid not null,
  club_id uuid not null,
  membership_id uuid not null,
  team_role text not null check(team_role in ('coach','player')),
  primary key(team_id,membership_id,team_role),
  foreign key(team_id,club_id) references public.teams(id,club_id),
  foreign key(membership_id,club_id) references public.club_memberships(id,club_id)
);
create table public.events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  team_id uuid,
  title text not null check(length(trim(title)) between 1 and 160),
  type text not null check(type in ('training','match','social')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  rsvp_deadline timestamptz,
  venue_name text,
  capacity integer check(capacity is null or capacity > 0),
  status text not null default 'scheduled' check(status in ('scheduled','cancelled')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check(ends_at>starts_at),
  check(rsvp_deadline is null or rsvp_deadline<=starts_at),
  foreign key(team_id,club_id) references public.teams(id,club_id),
  unique(id,club_id)
);
create table public.rsvps (
  event_id uuid not null,
  club_id uuid not null,
  user_id uuid not null references public.profiles(id),
  status text not null check(status in ('going','maybe','not_going','waitlist')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(event_id,user_id),
  foreign key(event_id,club_id) references public.events(id,club_id)
);
create table public.attendance_records (
  event_id uuid not null,
  club_id uuid not null,
  user_id uuid not null references public.profiles(id),
  status text not null check(status in ('present','absent','late')),
  marked_by uuid not null references public.profiles(id),
  marked_at timestamptz not null default now(),
  primary key(event_id,user_id),
  foreign key(event_id,club_id) references public.events(id,club_id)
);

-- SECURITY DEFINER helpers must be hardened against recursive RLS.
create function public.is_active_member(p_club uuid)
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.club_memberships m where m.club_id=p_club and m.user_id=(select auth.uid()) and m.status='active'); $$;
create function public.is_club_admin(p_club uuid)
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.club_memberships m join public.club_roles r on r.membership_id=m.id where m.club_id=p_club and m.user_id=(select auth.uid()) and m.status='active' and r.role='admin'); $$;
create function public.is_team_coach(p_club uuid,p_team uuid)
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.club_memberships m join public.team_memberships tm on tm.membership_id=m.id where m.club_id=p_club and m.user_id=(select auth.uid()) and m.status='active' and tm.team_id=p_team and tm.team_role='coach'); $$;

revoke all on function public.is_active_member(uuid) from public;
revoke all on function public.is_club_admin(uuid) from public;
revoke all on function public.is_team_coach(uuid,uuid) from public;
grant execute on function public.is_active_member(uuid),public.is_club_admin(uuid),public.is_team_coach(uuid,uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_memberships enable row level security;
alter table public.club_roles enable row level security;
alter table public.teams enable row level security;
alter table public.team_memberships enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.attendance_records enable row level security;

-- Profiles are owner-private by default; club roster previews should use a minimal trusted view.
create policy "profile self read" on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy "profile self insert" on public.profiles for insert to authenticated with check(id=(select auth.uid()));
create policy "profile self update" on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy "club active read" on public.clubs for select to authenticated using(public.is_active_member(id));
create policy "membership own or admin read" on public.club_memberships for select to authenticated using(user_id=(select auth.uid()) or public.is_club_admin(club_id));
create policy "roles own or admin read" on public.club_roles for select to authenticated using(exists(select 1 from public.club_memberships m where m.id=membership_id and (m.user_id=(select auth.uid()) or public.is_club_admin(m.club_id))));
create policy "teams active read" on public.teams for select to authenticated using(public.is_active_member(club_id));
create policy "team assignment own or admin" on public.team_memberships for select to authenticated using(exists(select 1 from public.club_memberships m where m.id=membership_id and (m.user_id=(select auth.uid()) or public.is_club_admin(m.club_id))));
create policy "events active read" on public.events for select to authenticated using(public.is_active_member(club_id) and (team_id is null or public.is_club_admin(club_id) or exists(select 1 from public.team_memberships tm join public.club_memberships m on m.id=tm.membership_id where tm.team_id=events.team_id and m.user_id=(select auth.uid()) and m.status='active')));
create policy "rsvp own read" on public.rsvps for select to authenticated using(user_id=(select auth.uid()) and public.is_active_member(club_id));
create policy "attendance own or admin read" on public.attendance_records for select to authenticated using(public.is_active_member(club_id) and (user_id=(select auth.uid()) or public.is_club_admin(club_id)));

-- No client table mutation policies for clubs, memberships, teams, events, RSVP or attendance.
-- Writes will be exposed only via separately audited server/RPC endpoints with atomic constraints.
-- Creation of the initial club requires a separate, tested server-side bootstrap transaction.
create index idx_club_memberships_user on public.club_memberships(user_id,club_id);
create index idx_team_memberships_member on public.team_memberships(membership_id);
create index idx_events_club_start on public.events(club_id,starts_at);
create index idx_rsvps_event_status on public.rsvps(event_id,status,created_at);
