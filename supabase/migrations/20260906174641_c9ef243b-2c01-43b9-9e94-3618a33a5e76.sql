CREATE OR REPLACE FUNCTION public.email_is_registered(_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users u WHERE lower(u.email) = lower(_email));
$$;

REVOKE ALL ON FUNCTION public.email_is_registered(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.email_is_registered(text) TO service_role;