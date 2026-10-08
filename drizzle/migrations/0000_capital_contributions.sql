CREATE TABLE public.capital_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  property_address text NOT NULL,
  project_status text NOT NULL DEFAULT 'Vendida',
  sale_price numeric, total_cost numeric, project_profit numeric, project_roi numeric,
  capital numeric NOT NULL, rate_pct numeric NOT NULL, profit numeric NOT NULL, total_to_collect numeric NOT NULL,
  deposits jsonb NOT NULL DEFAULT '[]'::jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capital_contributions TO authenticated;
GRANT ALL ON public.capital_contributions TO service_role;
ALTER TABLE public.capital_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin read" ON public.capital_contributions FOR SELECT TO authenticated
  USING (investor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write" ON public.capital_contributions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER capital_contributions_updated_at BEFORE UPDATE ON public.capital_contributions
  FOR EACH ROW EXECUTE FUNCTION public.tg_investments_updated_at();