-- chat_users: per-session visitor profile
CREATE TABLE public.chat_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  user_name text,
  ip_address text,
  country text,
  city text,
  device text,
  mode text NOT NULL DEFAULT 'ai',
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cu_public_insert" ON public.chat_users
  FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "cu_public_update_own" ON public.chat_users
  FOR UPDATE TO public USING (true) WITH CHECK (mode = 'ai' OR has_role(auth.uid(),'admin'));
CREATE POLICY "cu_public_select" ON public.chat_users
  FOR SELECT TO public USING (true);
CREATE POLICY "cu_admin_all" ON public.chat_users
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- chat_messages: per-message log
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','admin')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_session_idx ON public.chat_messages(session_id, created_at);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cm_public_insert" ON public.chat_messages
  FOR INSERT TO public WITH CHECK (role IN ('user','assistant'));
CREATE POLICY "cm_public_select" ON public.chat_messages
  FOR SELECT TO public USING (true);
CREATE POLICY "cm_admin_all" ON public.chat_messages
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL UNIQUE,
  client_name text,
  status text NOT NULL DEFAULT 'in_progress',
  progress integer NOT NULL DEFAULT 0,
  tracking_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "p_public_select" ON public.projects
  FOR SELECT TO public USING (true);
CREATE POLICY "p_admin_all" ON public.projects
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Knowledge base: file upload metadata
ALTER TABLE public.knowledge_base
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS file_name text;

-- Realtime
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_users;