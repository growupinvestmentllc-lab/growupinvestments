ALTER TABLE public.rental_monthly_entries
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'proximo_a_pagar',
  ADD COLUMN IF NOT EXISTS receipt_path text,
  ADD COLUMN IF NOT EXISTS receipt_name text;

ALTER TABLE public.rental_monthly_entries
  DROP CONSTRAINT IF EXISTS rental_monthly_entries_payment_status_check;

ALTER TABLE public.rental_monthly_entries
  ADD CONSTRAINT rental_monthly_entries_payment_status_check
  CHECK (payment_status IN ('alquiler_pagado', 'proximo_a_pagar', 'pendiente_pago'));

UPDATE public.rental_monthly_entries
SET payment_status = CASE
  WHEN paid_on IS NOT NULL OR income_rent > 0 THEN 'alquiler_pagado'
  ELSE 'proximo_a_pagar'
END;