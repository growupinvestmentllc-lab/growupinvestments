UPDATE public.projects p
SET owner_llc = 'GROWUP INVESTMENTS LLC',
    owner_pct_1 = po.percentage
FROM public.property_ownerships po
WHERE po.project_id = p.id
  AND upper(btrim(po.llc_name)) = 'GROWUP INVESTMENTS LLC'
  AND p.owner_llc IS NULL;

UPDATE public.projects p
SET owner_llc_2 = 'GROWUP INVESTMENTS LLC',
    owner_pct_2 = po.percentage
FROM public.property_ownerships po
WHERE po.project_id = p.id
  AND upper(btrim(po.llc_name)) = 'GROWUP INVESTMENTS LLC'
  AND p.owner_llc IS NOT NULL
  AND upper(btrim(p.owner_llc)) <> 'GROWUP INVESTMENTS LLC'
  AND p.owner_llc_2 IS NULL;

DROP POLICY IF EXISTS "investor sees own projects" ON public.projects;
CREATE POLICY "investor sees own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  auth.uid() = investor_id
  OR (current_user_llc() IS NOT NULL AND upper(btrim(owner_llc)) = upper(btrim(current_user_llc())))
  OR (current_user_llc() IS NOT NULL AND upper(btrim(owner_llc_2)) = upper(btrim(current_user_llc())))
);

REVOKE ALL ON FUNCTION public.has_project_ownership(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_project_ownership(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.has_project_ownership(uuid, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.has_project_ownership(uuid, text) FROM service_role;
DROP FUNCTION public.has_project_ownership(uuid, text);