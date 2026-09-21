
CREATE TABLE public.hunter_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('construccion','lote','rbi')),
  title text NOT NULL,
  location text,
  model text,
  bedrooms integer,
  bathrooms numeric,
  sqft_living numeric,
  sqft_total numeric,
  price numeric,
  deposit_required numeric,
  construction_cost numeric,
  lot_cost numeric,
  expected_sale_price numeric,
  expected_roi numeric,
  commission_pct numeric,
  image_url text,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hunter_offerings TO authenticated;
GRANT ALL ON public.hunter_offerings TO service_role;
ALTER TABLE public.hunter_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage offerings" ON public.hunter_offerings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Hunters read active offerings" ON public.hunter_offerings
  FOR SELECT TO authenticated
  USING (active AND public.has_role(auth.uid(), 'hunter'::app_role));

CREATE TABLE public.hunter_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('construccion','terminada','rbi')),
  address text NOT NULL,
  buyer_name text,
  sale_date date,
  sale_price numeric,
  commission_pct numeric,
  commission_amount numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hunter_sales TO authenticated;
GRANT ALL ON public.hunter_sales TO service_role;
ALTER TABLE public.hunter_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage hunter sales" ON public.hunter_sales
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Hunters read own sales" ON public.hunter_sales
  FOR SELECT TO authenticated
  USING (hunter_id = auth.uid());

CREATE TRIGGER hunter_offerings_updated_at BEFORE UPDATE ON public.hunter_offerings
  FOR EACH ROW EXECUTE FUNCTION public.tg_investments_updated_at();
CREATE TRIGGER hunter_sales_updated_at BEFORE UPDATE ON public.hunter_sales
  FOR EACH ROW EXECUTE FUNCTION public.tg_investments_updated_at();
