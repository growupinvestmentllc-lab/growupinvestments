
ALTER TABLE public.rental_properties
  ADD COLUMN IF NOT EXISTS property_tax_annual numeric,
  ADD COLUMN IF NOT EXISTS insurance_annual numeric,
  ADD COLUMN IF NOT EXISTS management_annual numeric,
  ADD COLUMN IF NOT EXISTS annual_rent numeric,
  ADD COLUMN IF NOT EXISTS cap_rate numeric,
  ADD COLUMN IF NOT EXISTS notes text;

UPDATE public.rental_properties SET
  owner_name = 'LAS TROPAS LLC (50%) · BLUE COAST REALTY LLC (50%)',
  ownership_pct = 50, tenant_name = 'Paulo Martinez',
  monthly_rent = 2200, monthly_expenses = 317,
  lease_end = '2026-08-31', status = 'venciendo',
  estimated_sale_price = 409000,
  property_tax_annual = 1195.83, insurance_annual = 2000, management_annual = 3804,
  annual_rent = 26400
WHERE address LIKE '2725 Embers%';

UPDATE public.rental_properties SET
  owner_name = 'REALSTOMA LLC (50%) · SAME LLC (50%)',
  ownership_pct = 50, tenant_name = 'Hendrik Toboso / Amaryls',
  monthly_rent = 2000, monthly_expenses = 160,
  lease_end = '2027-05-31', status = 'al_dia',
  purchase_price = 355000, estimated_sale_price = 359400,
  property_tax_annual = 600, insurance_annual = 2000, management_annual = 1920,
  annual_rent = 24000, cap_rate = 5.49
WHERE address LIKE '477 Rayford%';

UPDATE public.rental_properties SET
  owner_name = 'GROWUP INVESTMENTS LLC (100%)',
  ownership_pct = 100, tenant_name = 'Por confirmar',
  monthly_rent = 2100, monthly_expenses = 186, status = 'al_dia',
  annual_rent = 25200
WHERE address LIKE '472 Rajah%';

UPDATE public.rental_properties SET
  address = 'Unit A · 11224 Kimberly Ave, Englewood, FL',
  tenant_name = 'Mcalley E', ownership_pct = 100,
  monthly_rent = 1395, monthly_expenses = 185.90,
  lease_start = '2026-06-05', lease_end = '2027-06-30', status = 'al_dia',
  property_tax_annual = 8640, insurance_annual = 2000, management_annual = 1920,
  purchase_price = 499000, cap_rate = 4.44,
  notes = 'Units A+B: compra $499,000 · renta combinada $2,895/mes · NOI anual est. $12,560 · Cap rate 4.44%'
WHERE address LIKE '11224 Kimberly%';

UPDATE public.rental_properties SET
  address = 'Unit B · 11226 Kimberly Ave, Englewood, FL',
  tenant_name = 'Parker Richarme', ownership_pct = 100,
  monthly_rent = 1500, monthly_expenses = 215,
  lease_start = '2026-05-01', lease_end = '2027-04-30', status = 'al_dia',
  notes = 'Units A+B: compra $499,000 · renta combinada $2,895/mes · NOI anual est. $12,560 · Cap rate 4.44%'
WHERE address LIKE '11226 Kimberly%';

UPDATE public.rental_properties SET
  tenant_name = NULL, monthly_rent = 0, monthly_expenses = 0, status = 'vacante',
  notes = 'Último pago registrado: 27/08/2026 (saldo $0)'
WHERE address LIKE '1153 Chalmer%';

DELETE FROM public.rental_monthly_entries;

INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin, expense_repairs, expense_other)
SELECT p.id, m.month, 2026, m.rent, m.admin, m.rep, m.oth
FROM public.rental_properties p
JOIN (VALUES (3,2200,317,0,0),(4,2200,317,0,0),(5,2200,317,0,0),(6,2200,317,0,0),(7,2200,317,0,0),(8,2200,317,0,0)) AS m(month,rent,admin,rep,oth) ON true
WHERE p.address LIKE '2725 Embers%';

INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin, expense_repairs, expense_other)
SELECT p.id, m.month, 2026, m.rent, m.admin, m.rep, m.oth
FROM public.rental_properties p
JOIN (VALUES (7,1733,160,0,0),(8,2000,160,0,0)) AS m(month,rent,admin,rep,oth) ON true
WHERE p.address LIKE '477 Rayford%';

INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin, expense_repairs, expense_other)
SELECT p.id, m.month, 2026, m.rent, m.admin, m.rep, m.oth
FROM public.rental_properties p
JOIN (VALUES (7,2100,0,60,0),(8,2100,126,0,60)) AS m(month,rent,admin,rep,oth) ON true
WHERE p.address LIKE '472 Rajah%';

INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin, expense_repairs, expense_other)
SELECT p.id, m.month, 2026, m.rent, m.admin, m.rep, m.oth
FROM public.rental_properties p
JOIN (VALUES (6,1395,139.50,65,848.84),(7,1209,120.90,65,0)) AS m(month,rent,admin,rep,oth) ON true
WHERE p.address LIKE '%11224 Kimberly%';

INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, expense_admin, expense_repairs, expense_other)
SELECT p.id, m.month, 2026, m.rent, m.admin, m.rep, m.oth
FROM public.rental_properties p
JOIN (VALUES (5,1500,150,65,795),(6,1500,150,65,0),(7,1500,150,215,666.50)) AS m(month,rent,admin,rep,oth) ON true
WHERE p.address LIKE '%11226 Kimberly%';

CREATE TABLE IF NOT EXISTS public.project_draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  draw_number integer NOT NULL,
  label text,
  amount numeric NOT NULL DEFAULT 0,
  paid boolean NOT NULL DEFAULT false,
  paid_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, draw_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_draws TO authenticated;
GRANT ALL ON public.project_draws TO service_role;
ALTER TABLE public.project_draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_draws_select" ON public.project_draws FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects pr WHERE pr.id = project_id));
CREATE POLICY "project_draws_admin_write" ON public.project_draws FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.sync_project_deposited()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE pid uuid;
BEGIN
  pid := COALESCE(NEW.project_id, OLD.project_id);
  UPDATE public.projects p
     SET amount_deposited = COALESCE((
           SELECT SUM(d.amount) FROM public.project_draws d
            WHERE d.project_id = pid AND d.paid
         ), 0),
         updated_at = now()
   WHERE p.id = pid;
  RETURN NULL;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.sync_project_deposited() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_sync_project_deposited
AFTER INSERT OR UPDATE OR DELETE ON public.project_draws
FOR EACH ROW EXECUTE FUNCTION public.sync_project_deposited();

INSERT INTO public.project_draws (project_id, draw_number, label, amount, paid)
SELECT s.project_id, s.draw_number,
       (array_agg(s.stage_group ORDER BY s.stage_order))[1],
       MAX(COALESCE(s.draw_amount, 0)),
       bool_and(s.completed)
FROM public.project_stages s
WHERE s.draw_number IS NOT NULL
GROUP BY s.project_id, s.draw_number
ON CONFLICT (project_id, draw_number) DO NOTHING;
