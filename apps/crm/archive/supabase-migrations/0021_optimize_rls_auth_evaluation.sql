-- Optimize RLS policy auth lookups without changing authorization semantics.

drop policy if exists "Users can read their own roles" on public.user_roles;
create policy "Users can read their own roles"
on public.user_roles for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Admins can read quote requests" on public.quote_requests;
create policy "Admins can read quote requests"
on public.quote_requests for select to authenticated
using (exists (
  select 1 from public.user_roles ur
  where ur.user_id = (select auth.uid()) and ur.role = 'admin'::public.app_role
));

drop policy if exists "Admins can update quote requests" on public.quote_requests;
create policy "Admins can update quote requests"
on public.quote_requests for update to authenticated
using (exists (
  select 1 from public.user_roles ur
  where ur.user_id = (select auth.uid()) and ur.role = 'admin'::public.app_role
))
with check (exists (
  select 1 from public.user_roles ur
  where ur.user_id = (select auth.uid()) and ur.role = 'admin'::public.app_role
));

drop policy if exists "Admins can view review submissions" on public.review_submissions;
drop policy if exists "Public can view published reviews" on public.review_submissions;
create policy "Users can view published reviews"
on public.review_submissions for select to anon, authenticated
using (
  status = 'publié'::text
  or (
    (select auth.role()) = 'authenticated'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'::public.app_role
    )
  )
);

drop policy if exists "Admins can update review submissions" on public.review_submissions;
create policy "Admins can update review submissions"
on public.review_submissions for update to authenticated
using (exists (
  select 1 from public.user_roles ur
  where ur.user_id = (select auth.uid()) and ur.role = 'admin'::public.app_role
))
with check (exists (
  select 1 from public.user_roles ur
  where ur.user_id = (select auth.uid()) and ur.role = 'admin'::public.app_role
));

drop policy if exists "Admins can delete review submissions" on public.review_submissions;
create policy "Admins can delete review submissions"
on public.review_submissions for delete to authenticated
using (exists (
  select 1 from public.user_roles ur
  where ur.user_id = (select auth.uid()) and ur.role = 'admin'::public.app_role
));

drop policy if exists "Staff can read prospect activities" on public.prospect_activities;
create policy "Staff can read prospect activities"
on public.prospect_activities for select to authenticated
using ((select public.is_staff((select auth.uid()))));

drop policy if exists "Staff can insert prospect activities" on public.prospect_activities;
create policy "Staff can insert prospect activities"
on public.prospect_activities for insert to authenticated
with check (
  (select public.is_staff((select auth.uid())))
  and (created_by is null or created_by = (select auth.uid()))
);

drop policy if exists "Staff can delete own prospect activities" on public.prospect_activities;
create policy "Staff can delete own prospect activities"
on public.prospect_activities for delete to authenticated
using (
  (select public.is_staff((select auth.uid())))
  and created_by = (select auth.uid())
);

drop policy if exists "Staff can read prospect tasks" on public.prospect_tasks;
create policy "Staff can read prospect tasks"
on public.prospect_tasks for select to authenticated
using ((select public.is_staff((select auth.uid()))));

drop policy if exists "Staff can insert prospect tasks" on public.prospect_tasks;
create policy "Staff can insert prospect tasks"
on public.prospect_tasks for insert to authenticated
with check (
  (select public.is_staff((select auth.uid())))
  and (created_by is null or created_by = (select auth.uid()))
);

drop policy if exists "Staff can update prospect tasks" on public.prospect_tasks;
create policy "Staff can update prospect tasks"
on public.prospect_tasks for update to authenticated
using ((select public.is_staff((select auth.uid()))))
with check ((select public.is_staff((select auth.uid()))));

drop policy if exists "Staff can delete prospect tasks" on public.prospect_tasks;
create policy "Staff can delete prospect tasks"
on public.prospect_tasks for delete to authenticated
using ((select public.is_staff((select auth.uid()))));

drop policy if exists "Staff can read prospects" on public.prospects;
create policy "Staff can read prospects"
on public.prospects for select to authenticated
using ((select public.is_staff((select auth.uid()))));

drop policy if exists "Staff can insert prospects" on public.prospects;
create policy "Staff can insert prospects"
on public.prospects for insert to authenticated
with check ((select public.is_staff((select auth.uid()))));

drop policy if exists "Staff can update prospects" on public.prospects;
create policy "Staff can update prospects"
on public.prospects for update to authenticated
using ((select public.is_staff((select auth.uid()))))
with check ((select public.is_staff((select auth.uid()))));

drop policy if exists "Staff can delete prospects" on public.prospects;
create policy "Staff can delete prospects"
on public.prospects for delete to authenticated
using ((select public.is_staff((select auth.uid()))));

drop policy if exists "Staff can read searches" on public.prospect_searches;
create policy "Staff can read searches"
on public.prospect_searches for select to authenticated
using ((select public.is_staff((select auth.uid()))));

drop policy if exists "Staff can insert searches" on public.prospect_searches;
create policy "Staff can insert searches"
on public.prospect_searches for insert to authenticated
with check (
  (select public.is_staff((select auth.uid())))
  and (created_by is null or created_by = (select auth.uid()))
);
