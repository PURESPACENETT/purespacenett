-- The public review query already has an explicit public SELECT policy.
-- It does not need SECURITY DEFINER and should execute with caller privileges.

CREATE OR REPLACE FUNCTION public.get_published_reviews()
RETURNS TABLE(
  id uuid,
  author_name text,
  city text,
  service_type text,
  rating smallint,
  message text,
  created_at timestamptz,
  source text,
  source_url text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  select
    id,
    author_name,
    city,
    service_type,
    rating,
    message,
    created_at,
    source,
    source_url
  from public.review_submissions
  where status = 'publié'
  order by created_at desc
  limit 200
$function$;
