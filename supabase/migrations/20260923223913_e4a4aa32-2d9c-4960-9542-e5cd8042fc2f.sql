CREATE INDEX IF NOT EXISTS review_submissions_status_created_idx ON public.review_submissions (status, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_published_reviews()
RETURNS TABLE (id uuid, author_name text, city text, service_type text, rating smallint, message text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, author_name, city, service_type, rating, message, created_at
  FROM public.review_submissions
  WHERE status = 'publié'
  ORDER BY created_at DESC
  LIMIT 200
$$;

REVOKE ALL ON FUNCTION public.get_published_reviews() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_reviews() TO anon, authenticated, service_role;