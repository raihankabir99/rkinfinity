-- Private object storage for classroom chat attachments.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'classroom-attachments',
  'classroom-attachments',
  false,
  15728640,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg',
    'application/pdf', 'text/plain'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.classroom_chat_messages
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_mime text,
  add column if not exists attachment_size bigint;

alter table public.classroom_chat_messages
  drop constraint if exists classroom_chat_attachment_metadata_check;
alter table public.classroom_chat_messages
  add constraint classroom_chat_attachment_metadata_check check (
    (attachment_path is null and attachment_name is null and attachment_mime is null and attachment_size is null)
    or
    (attachment_path is not null and attachment_name is not null and attachment_mime is not null
      and attachment_size between 1 and 15728640)
  );
