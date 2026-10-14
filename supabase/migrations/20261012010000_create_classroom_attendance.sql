-- Persistent attendance for Infinit Classroom.
-- Server-only access: do not add anon/authenticated policies.
create table if not exists public.classroom_attendance (
  id uuid primary key default gen_random_uuid(),
  room_name text not null,
  participant_identity text not null,
  participant_name text not null,
  joined_at timestamptz not null,
  left_at timestamptz,
  created_at timestamptz not null default now(),
  constraint classroom_attendance_room_identity_joined_key unique (room_name, participant_identity, joined_at),
  constraint classroom_attendance_name_length check (char_length(participant_name) between 1 and 120),
  constraint classroom_attendance_room_length check (char_length(room_name) between 1 and 120),
  constraint classroom_attendance_leave_after_join check (left_at is null or left_at >= joined_at)
);
create index if not exists classroom_attendance_room_joined_idx
  on public.classroom_attendance (room_name, joined_at desc);
alter table public.classroom_attendance enable row level security;
revoke all on table public.classroom_attendance from anon, authenticated;
