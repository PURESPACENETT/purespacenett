-- Keep staff-role evaluation internal to RLS policies and trusted server code.
-- The function remains SECURITY DEFINER so it can inspect user_roles safely,
-- but it must not be callable through the public PostgREST RPC surface.
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO postgres, service_role;
