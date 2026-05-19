
-- Add llc_name to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS llc_name text;

-- Add owner_llc to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS owner_llc text;

-- Helper function: get the current user's llc_name (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.current_user_llc()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT llc_name FROM public.profiles WHERE id = auth.uid()
$$;

-- Drop and recreate the investor SELECT policy on projects to add LLC match
DROP POLICY IF EXISTS "investor sees own projects" ON public.projects;
CREATE POLICY "investor sees own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  auth.uid() = investor_id
  OR (
    owner_llc IS NOT NULL
    AND public.current_user_llc() IS NOT NULL
    AND owner_llc = public.current_user_llc()
  )
);

-- Update related table policies to follow the same access through projects
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
        OR (p.owner_llc IS NOT NULL AND p.owner_llc = public.current_user_llc())
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
        OR (p.owner_llc IS NOT NULL AND p.owner_llc = public.current_user_llc())
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
        OR (p.owner_llc IS NOT NULL AND p.owner_llc = public.current_user_llc())
      )
  )
);
