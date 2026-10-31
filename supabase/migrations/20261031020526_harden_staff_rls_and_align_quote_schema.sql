-- Keep quote_requests usable by the public site, CRM, and Meta lead ingestion.
-- These additions are idempotent because production may already contain them.
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS request_id uuid,
  ADD COLUMN IF NOT EXISTS crm_delivery_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_delivery_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS crm_delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_delivery_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_delivery_error text;

CREATE UNIQUE INDEX IF NOT EXISTS quote_requests_request_id_uidx
  ON public.quote_requests (request_id)
  WHERE request_id IS NOT NULL;

-- Partial leads from Meta do not necessarily include all fields required by the
-- CRM form. Keep the shared table permissive for those optional attributes.
ALTER TABLE public.quote_requests
  ALTER COLUMN client_type DROP NOT NULL,
  ALTER COLUMN property_type DROP NOT NULL,
  ALTER COLUMN frequency DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN postal_code DROP NOT NULL,
  ALTER COLUMN contact_name DROP NOT NULL;

-- The site has always used free-form text statuses. Convert the CRM-only enum
-- baseline to text when this migration follows that schema, preserving values.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'quote_requests'
      AND column_name = 'status'
      AND data_type = 'USER-DEFINED'
      AND udt_name = 'request_status'
  ) THEN
    ALTER TABLE public.quote_requests ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE public.quote_requests
      ALTER COLUMN status TYPE text USING status::text;
    ALTER TABLE public.quote_requests ALTER COLUMN status SET DEFAULT 'nouveau';
  END IF;
END;
$$;

-- Replace RLS calls to public.is_staff(uuid). That function is intentionally
-- revoked from authenticated users to keep it off the public RPC surface, so
-- policies must evaluate the caller's own role directly instead.
DO $$
DECLARE
  policy_row record;
  using_expression text;
  check_expression text;
  roles_clause text;
  staff_predicate constant text :=
    '(EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role::text IN (''admin'', ''staff'')))';
  create_statement text;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (coalesce(qual, '') ILIKE '%is_staff(%'
        OR coalesce(with_check, '') ILIKE '%is_staff(%')
  LOOP
    using_expression := policy_row.qual;
    check_expression := policy_row.with_check;

    IF using_expression IS NOT NULL THEN
      using_expression := replace(
        using_expression,
        '( SELECT is_staff(( SELECT auth.uid() AS uid)) AS is_staff)',
        staff_predicate
      );
      using_expression := replace(using_expression, 'is_staff(auth.uid())', staff_predicate);
    END IF;
    IF check_expression IS NOT NULL THEN
      check_expression := replace(
        check_expression,
        '( SELECT is_staff(( SELECT auth.uid() AS uid)) AS is_staff)',
        staff_predicate
      );
      check_expression := replace(check_expression, 'is_staff(auth.uid())', staff_predicate);
    END IF;

    IF coalesce(using_expression, '') ILIKE '%is_staff(%'
      OR coalesce(check_expression, '') ILIKE '%is_staff(%' THEN
      RAISE EXCEPTION 'Unrecognized is_staff policy expression on %.%', policy_row.tablename, policy_row.policyname;
    END IF;

    SELECT string_agg(quote_ident(role_name::text), ', ')
      INTO roles_clause
      FROM unnest(policy_row.roles) AS role_name;

    EXECUTE format('DROP POLICY %I ON %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
    create_statement := format(
      'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename,
      policy_row.permissive,
      policy_row.cmd,
      roles_clause
    );
    IF using_expression IS NOT NULL THEN
      create_statement := create_statement || format(' USING %s', using_expression);
    END IF;
    IF check_expression IS NOT NULL THEN
      create_statement := create_statement || format(' WITH CHECK %s', check_expression);
    END IF;
    EXECUTE create_statement;
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND (coalesce(qual, '') ILIKE '%is_staff(%'
        OR coalesce(with_check, '') ILIKE '%is_staff(%')
  ) THEN
    RAISE EXCEPTION 'Some RLS policies still call public.is_staff';
  END IF;
END;
$$;
