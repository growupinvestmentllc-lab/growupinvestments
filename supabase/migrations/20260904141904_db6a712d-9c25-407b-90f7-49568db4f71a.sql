DROP POLICY IF EXISTS "investor sees own projects" ON public.projects;

CREATE POLICY "investor sees own projects"
ON public.projects
FOR SELECT
USING (
  auth.uid() = investor_id
  OR (public.current_user_llc() IS NOT NULL AND owner_llc = public.current_user_llc())
  OR (public.current_user_llc() IS NOT NULL AND owner_llc_2 = public.current_user_llc())
  OR (
    public.current_user_llc() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.property_ownerships po
      WHERE po.project_id = projects.id
        AND upper(btrim(po.llc_name)) = upper(btrim(public.current_user_llc()))
    )
  )
);