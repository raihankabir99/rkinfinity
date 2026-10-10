-- Admin V2 foundation: security hardening + audit trail
-- Safe migration: does not change existing business data or public write flows.

-- 1) Sensitive AI configuration must never be publicly readable.
DROP POLICY IF EXISTS "bt_public_read" ON public.bot_training;
DROP POLICY IF EXISTS "kb_public_read" ON public.knowledge_base;

DROP POLICY IF EXISTS "bt_admin_read" ON public.bot_training;
CREATE POLICY "bt_admin_read" ON public.bot_training
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "kb_admin_read" ON public.knowledge_base;
CREATE POLICY "kb_admin_read" ON public.knowledge_base
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) Append-only audit log for administrative mutations.
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  table_name text NOT NULL,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_admin_read" ON public.audit_logs;
CREATE POLICY "audit_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No direct client INSERT/UPDATE/DELETE policy: rows are written by the
-- SECURITY DEFINER trigger below and are intentionally append-only.

CREATE OR REPLACE FUNCTION public.write_admin_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    actor_id, action, table_name, record_id, old_data, new_data
  )
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id::text
      ELSE NEW.id::text
    END,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- 3) Record changes to existing admin-managed resources.
DROP TRIGGER IF EXISTS audit_blog_posts ON public.blog_posts;
CREATE TRIGGER audit_blog_posts
AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.write_admin_audit_log();

DROP TRIGGER IF EXISTS audit_bot_training ON public.bot_training;
CREATE TRIGGER audit_bot_training
AFTER INSERT OR UPDATE OR DELETE ON public.bot_training
FOR EACH ROW EXECUTE FUNCTION public.write_admin_audit_log();

DROP TRIGGER IF EXISTS audit_knowledge_base ON public.knowledge_base;
CREATE TRIGGER audit_knowledge_base
AFTER INSERT OR UPDATE OR DELETE ON public.knowledge_base
FOR EACH ROW EXECUTE FUNCTION public.write_admin_audit_log();

DROP TRIGGER IF EXISTS audit_projects ON public.projects;
CREATE TRIGGER audit_projects
AFTER INSERT OR UPDATE OR DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.write_admin_audit_log();

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
  ON public.audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_table_record_idx
  ON public.audit_logs (table_name, record_id);
