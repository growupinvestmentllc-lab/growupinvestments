ALTER TABLE public.rental_owner_payments
ADD COLUMN amount numeric;

UPDATE public.rental_owner_payments op
SET amount = ROUND((
  COALESCE(e.income_rent, 0) + COALESCE(e.income_other, 0)
  - COALESCE(e.expense_admin, 0) - COALESCE(e.expense_repairs, 0)
  - COALESCE(e.expense_other, 0) - COALESCE(e.expense_insurance, 0)
  - COALESCE(e.expense_taxes, 0)
) * COALESCE(o.percentage, 0) / 100, 2)
FROM public.rental_monthly_entries e
JOIN public.rental_properties p ON p.id = e.property_id
JOIN public.property_ownerships o ON o.project_id = p.project_id
WHERE op.entry_id = e.id
  AND o.stage = 'alquiler'
  AND o.to_date IS NULL
  AND upper(o.llc_name) = upper(op.llc_name)
  AND op.amount IS NULL;