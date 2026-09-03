
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS estimated_sale_price numeric,
  ADD COLUMN IF NOT EXISTS total_contract_value numeric;

CREATE TABLE IF NOT EXISTS public.rental_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  address text NOT NULL,
  owner_name text,
  ownership_pct numeric NOT NULL DEFAULT 100,
  tenant_name text,
  monthly_rent numeric NOT NULL DEFAULT 0,
  monthly_expenses numeric NOT NULL DEFAULT 0,
  lease_start date,
  lease_end date,
  status text NOT NULL DEFAULT 'al_dia',
  purchase_price numeric,
  estimated_sale_price numeric,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rental_properties TO authenticated;
GRANT ALL ON public.rental_properties TO service_role;
ALTER TABLE public.rental_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rental_properties_select" ON public.rental_properties FOR SELECT TO authenticated
  USING (investor_id IS NULL OR investor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "rental_properties_admin_write" ON public.rental_properties FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.rental_monthly_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.rental_properties(id) ON DELETE CASCADE,
  month integer NOT NULL,
  year integer NOT NULL,
  income_rent numeric NOT NULL DEFAULT 0,
  income_other numeric NOT NULL DEFAULT 0,
  expense_admin numeric NOT NULL DEFAULT 0,
  expense_repairs numeric NOT NULL DEFAULT 0,
  expense_other numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, month, year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rental_monthly_entries TO authenticated;
GRANT ALL ON public.rental_monthly_entries TO service_role;
ALTER TABLE public.rental_monthly_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rental_entries_select" ON public.rental_monthly_entries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.rental_properties p WHERE p.id = property_id
    AND (p.investor_id IS NULL OR p.investor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "rental_entries_admin_write" ON public.rental_monthly_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.portfolio_for_sale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  address text NOT NULL,
  listing_price numeric NOT NULL DEFAULT 0,
  cost_base numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_for_sale TO authenticated;
GRANT ALL ON public.portfolio_for_sale TO service_role;
ALTER TABLE public.portfolio_for_sale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "for_sale_select" ON public.portfolio_for_sale FOR SELECT TO authenticated
  USING (investor_id IS NULL OR investor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "for_sale_admin_write" ON public.portfolio_for_sale FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.portfolio_sold (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  address text NOT NULL,
  sale_price numeric NOT NULL DEFAULT 0,
  sale_date date,
  cost_base numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_sold TO authenticated;
GRANT ALL ON public.portfolio_sold TO service_role;
ALTER TABLE public.portfolio_sold ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sold_select" ON public.portfolio_sold FOR SELECT TO authenticated
  USING (investor_id IS NULL OR investor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "sold_admin_write" ON public.portfolio_sold FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.rental_properties (address, owner_name, ownership_pct, tenant_name, monthly_rent, monthly_expenses, lease_start, lease_end, status, purchase_price, estimated_sale_price, sort_order, project_id) VALUES
 ('2725 Embers Pkwy W, Cape Coral, FL', NULL, 50, 'Paulo Martinez', 2200, 317, NULL, '2026-08-31', 'venciendo', NULL, 409000, 1, '22a81a71-0338-49da-9d2e-98c37c8a2c39'),
 ('477 Rayford St, Lehigh Acres, FL', NULL, 50, 'Hendrik Toboso', 2000, 160, NULL, '2027-05-31', 'al_dia', 355000, 359400, 2, '39f81f56-9c52-44ed-a810-2a094ab33ef5'),
 ('472 Rajah St, Lehigh Acres, FL', 'GROWUP INVESTMENTS LLC', 100, NULL, 2100, 186, NULL, NULL, 'al_dia', NULL, 320000, 3, '97dacb6f-4145-402a-941b-9fd4c4ff73ff'),
 ('11224 Kimberly Ave Unit A, Englewood, FL', NULL, 100, 'Mcalley E', 1395, 246, NULL, '2027-06-30', 'al_dia', NULL, NULL, 4, NULL),
 ('11226 Kimberly Ave Unit B, Englewood, FL', NULL, 100, 'Parker Richarme', 1500, 215, NULL, '2027-04-30', 'al_dia', NULL, NULL, 5, NULL),
 ('1153 Chalmer Ter, Port Charlotte, FL', NULL, 100, NULL, 0, 0, NULL, NULL, 'vacante', NULL, NULL, 6, NULL);

INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin)
SELECT id, 8, 2026, 2000, 160 FROM public.rental_properties WHERE address LIKE '477 Rayford%';
INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin)
SELECT id, 8, 2026, 2200, 317 FROM public.rental_properties WHERE address LIKE '2725 Embers%';
INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin)
SELECT id, 8, 2026, 2100, 186 FROM public.rental_properties WHERE address LIKE '472 Rajah%';
INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin)
SELECT id, 6, 2026, 1395, 246 FROM public.rental_properties WHERE address LIKE '11224 Kimberly%';
INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin)
SELECT id, 7, 2026, 1209, 246 FROM public.rental_properties WHERE address LIKE '11224 Kimberly%';
INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin)
SELECT id, 8, 2026, 1500, 215 FROM public.rental_properties WHERE address LIKE '11226 Kimberly%';

INSERT INTO public.portfolio_for_sale (address, listing_price, cost_base, project_id)
SELECT address, COALESCE(expected_sale_price,0), COALESCE(total_cost, construction_cost + lot_cost, 0), id
FROM public.projects WHERE status = 'A la venta';

INSERT INTO public.portfolio_sold (address, sale_price, cost_base, project_id)
SELECT address, COALESCE(expected_sale_price,0), COALESCE(total_cost, 0), id
FROM public.projects WHERE status = 'Vendida';
