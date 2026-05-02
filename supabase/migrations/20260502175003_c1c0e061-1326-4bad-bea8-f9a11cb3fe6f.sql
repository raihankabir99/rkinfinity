-- =============================
-- ROLES (security-definer pattern)
-- =============================
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

drop policy if exists "roles_self_read" on public.user_roles;
create policy "roles_self_read" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "roles_admin_read_all" on public.user_roles;
create policy "roles_admin_read_all" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "roles_admin_manage" on public.user_roles;
create policy "roles_admin_manage" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- shared updated_at trigger fn
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- =============================
-- BOT TRAINING (admin Q&A)
-- =============================
create table if not exists public.bot_training (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);
alter table public.bot_training enable row level security;

drop policy if exists "bt_public_read" on public.bot_training;
create policy "bt_public_read" on public.bot_training for select using (true);

drop policy if exists "bt_admin_write" on public.bot_training;
create policy "bt_admin_write" on public.bot_training for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- =============================
-- KNOWLEDGE BASE (admin docs)
-- =============================
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.knowledge_base enable row level security;

drop policy if exists "kb_public_read" on public.knowledge_base;
create policy "kb_public_read" on public.knowledge_base for select using (true);

drop policy if exists "kb_admin_write" on public.knowledge_base;
create policy "kb_admin_write" on public.knowledge_base for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

drop trigger if exists set_updated_at on public.knowledge_base;
create trigger set_updated_at before update on public.knowledge_base
  for each row execute function public.tg_set_updated_at();

-- =============================
-- BLOG POSTS (CMS)
-- =============================
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  category text not null default 'General',
  read_minutes int not null default 5,
  cover_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_published_idx
  on public.blog_posts (published, created_at desc);
alter table public.blog_posts enable row level security;

drop policy if exists "blog_public_read_published" on public.blog_posts;
create policy "blog_public_read_published" on public.blog_posts
  for select using (published = true);

drop policy if exists "blog_admin_read_all" on public.blog_posts;
create policy "blog_admin_read_all" on public.blog_posts
  for select to authenticated using (public.has_role(auth.uid(),'admin'));

drop policy if exists "blog_admin_write" on public.blog_posts;
create policy "blog_admin_write" on public.blog_posts for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

drop trigger if exists set_updated_at on public.blog_posts;
create trigger set_updated_at before update on public.blog_posts
  for each row execute function public.tg_set_updated_at();

-- =============================
-- VISITOR TRACKING
-- =============================
create table if not exists public.visitor_tracking (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  path text,
  referrer text,
  user_agent text,
  ip_address text,
  country text,
  city text,
  region text,
  created_at timestamptz not null default now()
);
create index if not exists visitor_tracking_created_idx
  on public.visitor_tracking (created_at desc);
alter table public.visitor_tracking enable row level security;

drop policy if exists "vt_public_insert" on public.visitor_tracking;
create policy "vt_public_insert" on public.visitor_tracking for insert with check (true);

drop policy if exists "vt_admin_read" on public.visitor_tracking;
create policy "vt_admin_read" on public.visitor_tracking for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

-- =============================
-- LEADS (contact form)
-- =============================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  source text,
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;

drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads for insert with check (true);

drop policy if exists "leads_admin_read" on public.leads;
create policy "leads_admin_read" on public.leads for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

-- =============================
-- SITE ERRORS
-- =============================
create table if not exists public.site_errors (
  id uuid primary key default gen_random_uuid(),
  message text,
  stack text,
  path text,
  level text default 'error',
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.site_errors enable row level security;

drop policy if exists "se_public_insert" on public.site_errors;
create policy "se_public_insert" on public.site_errors for insert with check (true);

drop policy if exists "se_admin_read" on public.site_errors;
create policy "se_admin_read" on public.site_errors for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

-- =============================
-- CHAT LOGS
-- =============================
create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_message text,
  bot_reply text,
  session_id text,
  created_at timestamptz not null default now()
);
alter table public.chat_logs enable row level security;

drop policy if exists "cl_public_insert" on public.chat_logs;
create policy "cl_public_insert" on public.chat_logs for insert with check (true);

drop policy if exists "cl_admin_read" on public.chat_logs;
create policy "cl_admin_read" on public.chat_logs for select to authenticated
  using (public.has_role(auth.uid(),'admin'));