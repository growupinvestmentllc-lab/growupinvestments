UPDATE public.rental_properties
SET annual_rent = 26400,
    property_tax_annual = 2100,
    insurance_annual = 1700.04,
    management_annual = 0,
    monthly_rent = 2200,
    monthly_expenses = 316.67,
    ownership_pct = 50,
    owner_name = 'LAS TROPAS LLC · BLUE COAST REALTY LLC',
    updated_at = now()
WHERE project_id = '22a81a71-0338-49da-9d2e-98c37c8a2c39'
  AND address ILIKE '2725 Embers Pkwy W%';