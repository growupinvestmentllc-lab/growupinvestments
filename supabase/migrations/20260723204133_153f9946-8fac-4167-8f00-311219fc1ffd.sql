
DROP POLICY "Authenticated can insert contact requests" ON public.contact_requests;
CREATE POLICY "Authenticated can insert contact requests" ON public.contact_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
