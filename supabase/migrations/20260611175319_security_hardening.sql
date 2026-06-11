-- Harden profiles UPDATE with WITH CHECK so RLS itself blocks llc_name changes
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND llc_name IS NOT DISTINCT FROM (SELECT p.llc_name FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Revoke EXECUTE on SECURITY DEFINER functions from public roles where not needed.
-- Trigger functions never need direct EXECUTE grants.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_ensure_project_documents() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_llc_name_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_project_documents(uuid) FROM PUBLIC, anon, authenticated;

-- has_role and current_user_llc are used in RLS policy expressions; authenticated needs EXECUTE.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.current_user_llc() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_llc() TO authenticated;
