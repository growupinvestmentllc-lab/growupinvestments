CREATE TABLE public.rental_owner_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.rental_monthly_entries(id) ON DELETE CASCADE,
  llc_name text NOT NULL,
  paid_on date,
  receipt_path text,
  receipt_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, llc_name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rental_owner_payments TO authenticated;
GRANT ALL ON public.rental_owner_payments TO service_role;
ALTER TABLE public.rental_owner_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage owner payments" ON public.rental_owner_payments FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "owners read own payments" ON public.rental_owner_payments FOR SELECT TO authenticated
USING (upper(llc_name) = upper(public.current_user_llc()));
CREATE TRIGGER rental_owner_payments_updated_at BEFORE UPDATE ON public.rental_owner_payments
FOR EACH ROW EXECUTE FUNCTION public.tg_investments_updated_at();
CREATE POLICY "owners read own rent receipts" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-documents' AND name LIKE 'rent-receipts/%' AND EXISTS (SELECT 1 FROM public.rental_owner_payments r WHERE r.receipt_path = objects.name));
INSERT INTO public.rental_owner_payments (entry_id, llc_name, paid_on)
SELECT e.id, o.llc_name, e.paid_on FROM public.rental_monthly_entries e
JOIN public.rental_properties p ON p.id = e.property_id
JOIN public.property_ownerships o ON o.project_id = p.project_id AND o.stage='alquiler' AND o.to_date IS NULL
WHERE e.paid_on IS NOT NULL ON CONFLICT DO NOTHING;