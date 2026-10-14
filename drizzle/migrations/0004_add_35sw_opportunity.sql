INSERT INTO public.opportunities (name, location, status, image_url, model, bedrooms, bathrooms, sqft_living, sqft_total, garage, builder, expected_roi, total_investment)
SELECT '35 SW 19th Ct', 'Cape Coral, FL', 'Lote permisado', image_url, model, bedrooms, bathrooms, sqft_living, sqft_total, 'Yes', 'Growup Investments', 0, 0
FROM public.hunter_offerings
WHERE id = 'ac4da30d-48ae-4f6f-814c-fbaf8da0f14d'
  AND NOT EXISTS (SELECT 1 FROM public.opportunities WHERE name = '35 SW 19th Ct');