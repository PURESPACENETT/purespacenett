alter policy "Admins can read quote requests"
  on public.quote_requests
  using (lower((select auth.jwt() ->> 'email')) = 'contact@purespacenett.com');

alter policy "Admins can update quote requests"
  on public.quote_requests
  using (lower((select auth.jwt() ->> 'email')) = 'contact@purespacenett.com')
  with check (lower((select auth.jwt() ->> 'email')) = 'contact@purespacenett.com');

alter policy "Admins can view review submissions"
  on public.review_submissions
  using (lower((select auth.jwt() ->> 'email')) = 'contact@purespacenett.com');

alter policy "Admins can update review submissions"
  on public.review_submissions
  using (lower((select auth.jwt() ->> 'email')) = 'contact@purespacenett.com')
  with check (lower((select auth.jwt() ->> 'email')) = 'contact@purespacenett.com');

alter policy "Admins can delete review submissions"
  on public.review_submissions
  using (lower((select auth.jwt() ->> 'email')) = 'contact@purespacenett.com');

alter policy "Public can view published reviews"
  on public.review_submissions
  using (lower((select auth.jwt() ->> 'email')) = 'contact@purespacenett.com');

revoke all on function public.get_published_reviews() from public, anon, authenticated;
grant execute on function public.get_published_reviews() to service_role;
