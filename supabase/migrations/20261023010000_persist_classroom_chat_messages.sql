-- Persist LiveKit room chat messages. Access is server-only; participants authenticate via signed LiveKit JWTs.
create table if not exists public.classroom_chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_name text not null,
  client_message_id uuid not null,
  sender_identity text not null,
  sender_name text not null,
  recipient_identity text,
  content text not null,
  created_at timestamptz not null default now(),
  constraint classroom_chat_content_length check (char_length(content) between 1 and 4000),
  constraint classroom_chat_room_length check (char_length(room_name) between 1 and 120),
  constraint classroom_chat_sender_name_length check (char_length(sender_name) between 1 and 120),
  constraint classroom_chat_room_sender_client_key unique (room_name, sender_identity, client_message_id)
);
create index if not exists classroom_chat_room_created_idx
  on public.classroom_chat_messages (room_name, created_at desc, id desc);
create index if not exists classroom_chat_recipient_idx
  on public.classroom_chat_messages (room_name, recipient_identity, created_at desc)
  where recipient_identity is not null;
alter table public.classroom_chat_messages enable row level security;
revoke all on table public.classroom_chat_messages from anon, authenticated;
