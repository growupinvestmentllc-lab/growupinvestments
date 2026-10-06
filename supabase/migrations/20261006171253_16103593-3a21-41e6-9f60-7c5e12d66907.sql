CREATE TABLE public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  lender text NOT NULL,
  borrower text NOT NULL,
  borrower_signer text,
  principal numeric NOT NULL,
  rate_pct numeric NOT NULL,
  issue_date date NOT NULL,
  lender_signed_date date,
  maturity_date date NOT NULL,
  interest_at_maturity numeric NOT NULL,
  total_at_maturity numeric NOT NULL,
  status text NOT NULL DEFAULT 'Activo',
  collateral_address text,
  collateral_description text,
  collateral_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  document_path text,
  document_name text,
  docusign_envelope_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loans TO authenticated;
GRANT ALL ON public.loans TO service_role;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investor sees own loans" ON public.loans FOR SELECT TO authenticated
  USING (investor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manages loans" ON public.loans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION public.tg_investments_updated_at();
CREATE POLICY "Loan owner reads loan docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-documents' AND name LIKE 'loans/%' AND EXISTS (SELECT 1 FROM public.loans l WHERE l.document_path = storage.objects.name AND l.investor_id = auth.uid()));