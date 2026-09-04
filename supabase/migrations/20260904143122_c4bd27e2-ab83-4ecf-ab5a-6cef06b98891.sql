CREATE OR REPLACE FUNCTION public.has_project_ownership(_project_id uuid, _llc_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_ownerships po
    WHERE po.project_id = _project_id
      AND upper(btrim(po.llc_name)) = upper(btrim(_llc_name))
  )
$$;

REVOKE ALL ON FUNCTION public.has_project_ownership(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_project_ownership(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_project_ownership(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_project_ownership(uuid, text) TO service_role;

DROP POLICY IF EXISTS "investor sees own projects" ON public.projects;
CREATE POLICY "investor sees own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  auth.uid() = investor_id
  OR (current_user_llc() IS NOT NULL AND upper(btrim(owner_llc)) = upper(btrim(current_user_llc())))
  OR (current_user_llc() IS NOT NULL AND upper(btrim(owner_llc_2)) = upper(btrim(current_user_llc())))
  OR (current_user_llc() IS NOT NULL AND public.has_project_ownership(id, current_user_llc()))
);