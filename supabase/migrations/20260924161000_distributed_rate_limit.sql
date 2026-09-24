-- Rate limiting distribué pour les endpoints publics.
-- La fonction est SECURITY DEFINER mais son exécution est réservée au rôle service_role.

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key text PRIMARY KEY,
  count integer NOT NULL,
  reset_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_buckets_updated_at_idx
  ON public.rate_limit_buckets (updated_at);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.rate_limit_buckets FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS TABLE (
  allowed boolean,
  retry_after_seconds integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_bucket public.rate_limit_buckets%ROWTYPE;
BEGIN
  IF p_bucket_key IS NULL OR length(p_bucket_key) = 0
     OR p_limit <= 0 OR p_window_seconds <= 0 THEN
    RAISE EXCEPTION 'Invalid rate limit arguments';
  END IF;

  INSERT INTO public.rate_limit_buckets (bucket_key, count, reset_at)
  VALUES (p_bucket_key, 1, v_now + make_interval(secs => p_window_seconds))
  ON CONFLICT (bucket_key) DO NOTHING;

  SELECT *
    INTO v_bucket
    FROM public.rate_limit_buckets
   WHERE bucket_key = p_bucket_key
   FOR UPDATE;

  IF v_bucket.reset_at <= v_now THEN
    UPDATE public.rate_limit_buckets
       SET count = 1,
           reset_at = v_now + make_interval(secs => p_window_seconds),
           updated_at = v_now
     WHERE bucket_key = p_bucket_key;

    RETURN QUERY SELECT true, 0;
    RETURN;
  END IF;

  IF v_bucket.count >= p_limit THEN
    UPDATE public.rate_limit_buckets
       SET updated_at = v_now
     WHERE bucket_key = p_bucket_key;

    RETURN QUERY
      SELECT false,
             GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_bucket.reset_at - v_now)))::integer);
    RETURN;
  END IF;

  UPDATE public.rate_limit_buckets
     SET count = count + 1,
         updated_at = v_now
   WHERE bucket_key = p_bucket_key;

  RETURN QUERY SELECT true, 0;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;

-- Nettoyage opportuniste : les anciennes clés peuvent être supprimées par une tâche planifiée.
