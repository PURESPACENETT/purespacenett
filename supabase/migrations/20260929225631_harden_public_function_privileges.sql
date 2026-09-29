-- Harden public RPC privileges.
-- get_google_review_config() reads decrypted Vault secrets and must never be callable
-- by browser roles. is_staff() is used by authenticated application authorization only.

REVOKE EXECUTE ON FUNCTION public.get_google_review_config() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_google_review_config() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_google_review_config() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
