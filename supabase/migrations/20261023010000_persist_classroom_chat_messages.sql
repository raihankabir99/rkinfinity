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

-- Database-side burst limit: max 10 messages per participant identity per 10 seconds.
create or replace function public.limit_classroom_chat_message_rate()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  recent_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(new.room_name), hashtext(new.sender_identity));
  select count(*) into recent_count
  from public.classroom_chat_messages
  where room_name = new.room_name
    and sender_identity = new.sender_identity
    and created_at > now() - interval '10 seconds';
  if recent_count >= 10 then
    raise exception 'Room chat rate limit exceeded. Please wait before sending again.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists classroom_chat_rate_limit on public.classroom_chat_messages;
create trigger classroom_chat_rate_limit
  before insert on public.classroom_chat_messages
  for each row execute function public.limit_classroom_chat_message_rate();