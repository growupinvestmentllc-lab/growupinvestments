
-- Public read for portfolio bucket
CREATE POLICY "portfolio public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

-- Authenticated users can upload
CREATE POLICY "portfolio authenticated insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio');

-- Allow investors linked to a project to insert portfolio_images
CREATE POLICY "investor inserts own project images"
ON public.portfolio_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = portfolio_images.project_id
      AND (
        p.investor_id = auth.uid()
        OR p.owner_llc = current_user_llc()
        OR p.owner_llc_2 = current_user_llc()
      )
  )
);
