
REVOKE EXECUTE ON FUNCTION public.current_user_llc() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_llc() TO authenticated;
