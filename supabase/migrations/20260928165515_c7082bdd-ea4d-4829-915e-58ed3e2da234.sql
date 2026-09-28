ALTER TABLE public.rental_properties
  ADD COLUMN IF NOT EXISTS other_monthly_expenses numeric NOT NULL DEFAULT 0;