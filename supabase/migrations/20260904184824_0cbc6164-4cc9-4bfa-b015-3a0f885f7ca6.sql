DROP POLICY IF EXISTS "investor sees own stages" ON public.project_stages;

CREATE POLICY "investor sees own stages" ON public.project_stages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_stages.project_id
      AND (
        p.investor_id = auth.uid()
        OR (public.current_user_llc() IS NOT NULL AND upper(btrim(p.owner_llc)) = upper(btrim(public.current_user_llc())))
        OR (public.current_user_llc() IS NOT NULL AND upper(btrim(p.owner_llc_2)) = upper(btrim(public.current_user_llc())))
        OR (public.current_user_llc() IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.property_ownerships po
          WHERE po.project_id = p.id
            AND upper(btrim(po.llc_name)) = upper(btrim(public.current_user_llc()))
        ))
      )
  )
);