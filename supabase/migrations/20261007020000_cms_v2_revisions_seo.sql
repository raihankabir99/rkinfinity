-- CMS V2: additive blog revisions + SEO metadata
-- Safe: existing blog_posts rows/columns remain unchanged.

CREATE TABLE IF NOT EXISTS public.blog_post_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  version integer NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text,
  content text NOT NULL,
  category text NOT NULL,
  read_minutes integer NOT NULL,
  cover_url text,
  published boolean NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, version)
);

CREATE INDEX IF NOT EXISTS blog_post_revisions_post_idx
  ON public.blog_post_revisions(post_id, version DESC);

ALTER TABLE public.blog_post_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_revisions_admin_read" ON public.blog_post_revisions;
CREATE POLICY "blog_revisions_admin_read"
  ON public.blog_post_revisions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "blog_revisions_admin_write" ON public.blog_post_revisions;
CREATE POLICY "blog_revisions_admin_write"
  ON public.blog_post_revisions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.snapshot_blog_post_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version integer;
  source_row public.blog_posts;
BEGIN
  source_row := CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;

  SELECT COALESCE(MAX(version), 0) + 1
    INTO next_version
    FROM public.blog_post_revisions
    WHERE post_id = source_row.id;

  INSERT INTO public.blog_post_revisions (
    post_id, version, title, slug, excerpt, content, category,
    read_minutes, cover_url, published, created_by
  )
  VALUES (
    source_row.id, next_version, source_row.title, source_row.slug,
    source_row.excerpt, source_row.content, source_row.category,
    source_row.read_minutes, source_row.cover_url, source_row.published,
    auth.uid()
  );

  RETURN source_row;
END;
$$;

DROP TRIGGER IF EXISTS snapshot_blog_post_revision ON public.blog_posts;
CREATE TRIGGER snapshot_blog_post_revision
AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.snapshot_blog_post_revision();

CREATE TABLE IF NOT EXISTS public.blog_seo_metadata (
  post_id uuid PRIMARY KEY REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  meta_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  noindex boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.blog_seo_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_seo_public_read" ON public.blog_seo_metadata;
CREATE POLICY "blog_seo_public_read"
  ON public.blog_seo_metadata
  FOR SELECT USING (
    noindex = false
    AND EXISTS (
      SELECT 1 FROM public.blog_posts p
      WHERE p.id = post_id AND p.published = true
    )
  );

DROP POLICY IF EXISTS "blog_seo_admin_manage" ON public.blog_seo_metadata;
CREATE POLICY "blog_seo_admin_manage"
  ON public.blog_seo_metadata
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_blog_seo_metadata()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_blog_seo_metadata ON public.blog_seo_metadata;
CREATE TRIGGER touch_blog_seo_metadata
BEFORE UPDATE ON public.blog_seo_metadata
FOR EACH ROW EXECUTE FUNCTION public.touch_blog_seo_metadata();
