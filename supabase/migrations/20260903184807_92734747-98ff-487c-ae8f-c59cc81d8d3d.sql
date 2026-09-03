CREATE TABLE public.property_ownerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  llc_name text NOT NULL,
  percentage numeric NOT NULL DEFAULT 0,
  stage text NOT NULL DEFAULT 'construccion',
  from_date date,
  to_date date,
  exit_date date,
  exit_price numeric,
  exit_cost_base numeric,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_ownerships TO authenticated;
GRANT ALL ON public.property_ownerships TO service_role;

ALTER TABLE public.property_ownerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ownerships"
ON public.property_ownerships FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Investors read own ownerships"
ON public.property_ownerships FOR SELECT TO authenticated
USING (
  llc_name = public.current_user_llc()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = property_ownerships.project_id
      AND p.investor_id = auth.uid()
  )
);

CREATE INDEX idx_property_ownerships_project ON public.property_ownerships(project_id);

CREATE TRIGGER property_ownerships_updated_at
BEFORE UPDATE ON public.property_ownerships
FOR EACH ROW EXECUTE FUNCTION public.tg_investments_updated_at();