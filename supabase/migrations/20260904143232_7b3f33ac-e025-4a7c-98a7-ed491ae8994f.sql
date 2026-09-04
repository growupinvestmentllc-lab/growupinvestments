DROP POLICY IF EXISTS "Investors read own ownerships" ON public.property_ownerships;
CREATE POLICY "Investors read own ownerships"
ON public.property_ownerships
FOR SELECT
TO authenticated
USING (
  current_user_llc() IS NOT NULL
  AND upper(btrim(llc_name)) = upper(btrim(current_user_llc()))
);

DROP POLICY IF EXISTS "investor sees own projects" ON public.projects;
CREATE POLICY "investor sees own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  auth.uid() = investor_id
  OR (current_user_llc() IS NOT NULL AND upper(btrim(owner_llc)) = upper(btrim(current_user_llc())))
  OR (current_user_llc() IS NOT NULL AND upper(btrim(owner_llc_2)) = upper(btrim(current_user_llc())))
  OR (
    current_user_llc() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.property_ownerships po
      WHERE po.project_id = projects.id
        AND upper(btrim(po.llc_name)) = upper(btrim(current_user_llc()))
    )
  )
);