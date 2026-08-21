
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_llc text NOT NULL,
  percentage numeric NOT NULL DEFAULT 100,
  total_deposited numeric NOT NULL DEFAULT 0,
  total_pending numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, owner_llc)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage investments" ON public.investments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "owner sees own investment" ON public.investments FOR SELECT TO authenticated
  USING (owner_llc = public.current_user_llc());
CREATE POLICY "owner updates own investment" ON public.investments FOR UPDATE TO authenticated
  USING (owner_llc = public.current_user_llc())
  WITH CHECK (owner_llc = public.current_user_llc());

CREATE TABLE public.investment_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  paid_on date NOT NULL DEFAULT current_date,
  amount numeric NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investment_payments TO authenticated;
GRANT ALL ON public.investment_payments TO service_role;
ALTER TABLE public.investment_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage investment payments" ON public.investment_payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "owner sees own payments" ON public.investment_payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investments i WHERE i.id = investment_payments.investment_id AND i.owner_llc = public.current_user_llc()));
CREATE POLICY "owner manages own payments" ON public.investment_payments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investments i WHERE i.id = investment_payments.investment_id AND i.owner_llc = public.current_user_llc()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.investments i WHERE i.id = investment_payments.investment_id AND i.owner_llc = public.current_user_llc()));

CREATE OR REPLACE FUNCTION public.tg_investments_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER investments_updated_at BEFORE UPDATE ON public.investments
FOR EACH ROW EXECUTE FUNCTION public.tg_investments_updated_at();

-- Seed: one row per owner, financials split by percentage
INSERT INTO public.investments (project_id, owner_llc, percentage, total_deposited, total_pending)
SELECT p.id, trim(p.owner_llc), coalesce(p.owner_pct_1,100),
       round(coalesce(p.amount_deposited,0) * coalesce(p.owner_pct_1,100)/100.0, 2),
       round(greatest(0, coalesce(p.total_cost,0) - coalesce(p.amount_deposited,0)) * coalesce(p.owner_pct_1,100)/100.0, 2)
FROM public.projects p
WHERE p.owner_llc IS NOT NULL AND length(trim(p.owner_llc)) > 0
ON CONFLICT (project_id, owner_llc) DO NOTHING;

INSERT INTO public.investments (project_id, owner_llc, percentage, total_deposited, total_pending)
SELECT p.id, trim(p.owner_llc_2), coalesce(p.owner_pct_2,0),
       round(coalesce(p.amount_deposited,0) * coalesce(p.owner_pct_2,0)/100.0, 2),
       round(greatest(0, coalesce(p.total_cost,0) - coalesce(p.amount_deposited,0)) * coalesce(p.owner_pct_2,0)/100.0, 2)
FROM public.projects p
WHERE p.owner_llc_2 IS NOT NULL AND length(trim(p.owner_llc_2)) > 0
ON CONFLICT (project_id, owner_llc) DO NOTHING;
