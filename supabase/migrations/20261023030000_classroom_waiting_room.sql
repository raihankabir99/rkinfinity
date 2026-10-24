-- Server-only admission requests for LiveKit rooms with a waiting room.
create table if not exists public.classroom_admission_requests (
  id uuid primary key default gen_random_uuid(),
  room_name text not null,
  participant_identity text not null,
  participant_name text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text,
  constraint classroom_admission_name_length check (char_length(participant_name) between 1 and 120),
  constraint classroom_admission_room_length check (char_length(room_name) between 1 and 120)
);
create index if not exists classroom_admission_room_status_idx
  on public.classroom_admission_requests (room_name, status, created_at asc);
alter table public.classroom_admission_requests enable row level security;
revoke all on table public.classroom_admission_requests from anon, authenticated;