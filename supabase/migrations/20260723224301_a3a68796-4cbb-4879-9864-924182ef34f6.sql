ALTER TABLE public.opportunities 
  ADD COLUMN IF NOT EXISTS bedrooms integer,
  ADD COLUMN IF NOT EXISTS bathrooms numeric,
  ADD COLUMN IF NOT EXISTS study integer;

UPDATE public.opportunities SET bedrooms = 3, study = 1, bathrooms = 2 WHERE name ILIKE '329 NE 13th%';