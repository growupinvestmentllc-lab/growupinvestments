INSERT INTO public.rental_properties (id, investor_id, project_id, address, owner_name, ownership_pct, tenant_name, monthly_rent, monthly_expenses, lease_start, lease_end, status, purchase_price, estimated_sale_price, sort_order)
VALUES ('139299e6-77d2-43e3-9fe0-622548ce3d13', 'c7f472ed-73c6-413d-b970-9b03b69d8fdd', '22a81a71-0338-49da-9d2e-98c37c8a2c39', '2725 Embers Pkwy W, Cape Coral, FL', 'LAS TROPAS LLC · BLUE COAST REALTY LLC', 50, 'Paulo Martinez', 2200, 317, '2026-03-01', NULL, 'venciendo', NULL, 409000, 1);

INSERT INTO public.rental_monthly_entries (property_id, month, year, income_rent, income_other, expense_admin, expense_repairs, expense_other, expense_insurance, expense_taxes, paid_on)
SELECT '139299e6-77d2-43e3-9fe0-622548ce3d13', m, 2026, 2200, 0, 0, 0, 0, 141.67, 175,
  CASE WHEN m = 9 THEN DATE '2026-09-23' ELSE NULL END
FROM generate_series(3, 9) AS m;

INSERT INTO public.rental_owner_payments (entry_id, llc_name, paid_on, amount)
SELECT e.id, llc, DATE '2026-09-23', 941.50
FROM public.rental_monthly_entries e
CROSS JOIN (VALUES ('BLUE COAST REALTY LLC'), ('LAS TROPAS LLC')) AS t(llc)
WHERE e.property_id = '139299e6-77d2-43e3-9fe0-622548ce3d13' AND e.month = 9 AND e.year = 2026;