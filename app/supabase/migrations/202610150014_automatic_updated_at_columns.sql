-- Linked Supabase migration 20261015173021
-- Step 65: automatic update timestamps on core mutable records.
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.clubs add column if not exists updated_at timestamptz not null default now();
alter table public.club_memberships add column if not exists updated_at timestamptz not null default now();
alter table public.teams add column if not exists updated_at timestamptz not null default now();
alter table public.events add column if not exists updated_at timestamptz not null default now();

create or replace function app_private.touch_updated_at()
returns trigger language plpgsql set search_path='' as $$
begin
  new.updated_at := now();
  return new;
end;$$;
revoke all on function app_private.touch_updated_at() from public,anon,authenticated;
create trigger trg_profiles_touch before update on public.profiles
for each row execute function app_private.touch_updated_at();
create trigger trg_clubs_touch before update on public.clubs
for each row execute function app_private.touch_updated_at();
create trigger trg_memberships_touch before update on public.club_memberships
for each row execute function app_private.touch_updated_at();
create trigger trg_teams_touch before update on public.teams
for each row execute function app_private.touch_updated_at();
create trigger trg_events_touch before update on public.events
for each row execute function app_private.touch_updated_at();

