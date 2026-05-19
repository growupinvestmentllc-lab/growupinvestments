
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS owner_llc_2 text,
  ADD COLUMN IF NOT EXISTS owner_pct_1 numeric,
  ADD COLUMN IF NOT EXISTS owner_pct_2 numeric;

DROP POLICY IF EXISTS "investor sees own projects" ON public.projects;
CREATE POLICY "investor sees own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  auth.uid() = investor_id
  OR (public.current_user_llc() IS NOT NULL AND owner_llc = public.current_user_llc())
  OR (public.current_user_llc() IS NOT NULL AND owner_llc_2 = public.current_user_llc())
);

DROP POLICY IF EXISTS "investor sees own images" ON public.portfolio_images;
CREATE POLICY "investor sees own images"
ON public.portfolio_images
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = portfolio_images.project_id
      AND (
        p.investor_id = auth.uid()
        OR p.owner_llc = public.current_user_llc()
        OR p.owner_llc_2 = public.current_user_llc()
      )
  )
);

DROP POLICY IF EXISTS "investor sees own comps" ON public.comparables;
CREATE POLICY "investor sees own comps"
ON public.comparables
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = comparables.project_id
      AND (
        p.investor_id = auth.uid()
        OR p.owner_llc = public.current_user_llc()
        OR p.owner_llc_2 = public.current_user_llc()
      )
  )
);

DROP POLICY IF EXISTS "investor sees own stages" ON public.project_stages;
CREATE POLICY "investor sees own stages"
ON public.project_stages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_stages.project_id
      AND (
        p.investor_id = auth.uid()
        OR p.owner_llc = public.current_user_llc()
        OR p.owner_llc_2 = public.current_user_llc()
      )
  )
);
