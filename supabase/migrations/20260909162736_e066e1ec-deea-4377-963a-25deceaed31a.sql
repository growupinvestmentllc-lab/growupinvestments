ALTER TABLE public.rental_monthly_entries
  ADD COLUMN IF NOT EXISTS expense_insurance numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expense_taxes numeric NOT NULL DEFAULT 0;