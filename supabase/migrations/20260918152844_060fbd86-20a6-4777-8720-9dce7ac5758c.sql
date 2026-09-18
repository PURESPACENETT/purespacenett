DROP POLICY IF EXISTS "Admins can view review submissions" ON public.review_submissions;
DROP POLICY IF EXISTS "Admins can update review submissions" ON public.review_submissions;
DROP POLICY IF EXISTS "Admins can delete review submissions" ON public.review_submissions;

CREATE POLICY "Admins can view review submissions" ON public.review_submissions
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));

CREATE POLICY "Admins can update review submissions" ON public.review_submissions
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));

CREATE POLICY "Admins can delete review submissions" ON public.review_submissions
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;