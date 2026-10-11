alter policy "Public can view published reviews"
  on public.review_submissions
  using (status = 'publié');

grant execute on function public.get_published_reviews() to anon, authenticated, service_role;
