create table if not exists public.classroom_scheduled_meetings (
  id uuid primary key default gen_random_uuid(),
  room_name text not null,
  owner_identity text not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint classroom_schedule_title_length check (char_length(title) between 1 and 120),
  constraint classroom_schedule_room_length check (char_length(room_name) between 1 and 120),
  constraint classroom_schedule_valid_duration check (ends_at > starts_at)
);
create index if not exists classroom_schedule_room_start_idx
  on public.classroom_scheduled_meetings (room_name, starts_at asc) where cancelled_at is null;
create index if not exists classroom_schedule_start_idx
  on public.classroom_scheduled_meetings (starts_at asc) where cancelled_at is null;
alter table public.classroom_scheduled_meetings enable row level security;
revoke all on table public.classroom_scheduled_meetings from anon, authenticated;