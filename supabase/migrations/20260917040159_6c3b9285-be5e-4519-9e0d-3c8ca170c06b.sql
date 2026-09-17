CREATE TABLE public.review_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  city TEXT,
  service_type TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_submissions TO authenticated;
GRANT ALL ON public.review_submissions TO service_role;

ALTER TABLE public.review_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view review submissions"
  ON public.review_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update review submissions"
  ON public.review_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete review submissions"
  ON public.review_submissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));