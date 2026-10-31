-- Keep the CRM private to the proprietor's single verified admin account.
DO $$
DECLARE
  owner_id uuid;
  owner_count integer;
  policy_row record;
  using_expression text;
  check_expression text;
  roles_clause text;
  create_statement text;
  admin_predicate constant text :=
    '((ur.role)::text = ''admin''::text)';
BEGIN
  SELECT count(*)
    INTO owner_count
    FROM auth.users
    WHERE lower(email) = 'contact@purespacenett.com'
      AND email_confirmed_at IS NOT NULL;

  IF owner_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one confirmed proprietor account; found %', owner_count;
  END IF;

  SELECT id INTO owner_id
    FROM auth.users
    WHERE lower(email) = 'contact@purespacenett.com'
      AND email_confirmed_at IS NOT NULL;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (owner_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  FOR policy_row IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (coalesce(qual, '') ILIKE '%''staff''::text%'
        OR coalesce(with_check, '') ILIKE '%''staff''::text%')
  LOOP
    using_expression := policy_row.qual;
    check_expression := policy_row.with_check;

    IF using_expression IS NOT NULL THEN
      using_expression := replace(
        using_expression,
        '((ur.role)::text = ANY (ARRAY[''admin''::text, ''staff''::text]))',
        admin_predicate
      );
    END IF;
    IF check_expression IS NOT NULL THEN
      check_expression := replace(
        check_expression,
        '((ur.role)::text = ANY (ARRAY[''admin''::text, ''staff''::text]))',
        admin_predicate
      );
    END IF;

    IF coalesce(using_expression, '') ILIKE '%''staff''::text%'
      OR coalesce(check_expression, '') ILIKE '%''staff''::text%' THEN
      RAISE EXCEPTION 'Unrecognized staff role expression on %.%', policy_row.tablename, policy_row.policyname;
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
      AND (coalesce(qual, '') ILIKE '%''staff''::text%'
        OR coalesce(with_check, '') ILIKE '%''staff''::text%')
  ) THEN
    RAISE EXCEPTION 'Some policies still permit the staff role';
  END IF;
END;
$$;
