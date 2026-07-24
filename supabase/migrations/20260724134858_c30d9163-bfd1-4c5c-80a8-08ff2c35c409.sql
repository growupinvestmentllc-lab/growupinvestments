ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS sqft_total integer,
  ADD COLUMN IF NOT EXISTS sqft_living integer,
  ADD COLUMN IF NOT EXISTS garage text,
  ADD COLUMN IF NOT EXISTS constructor text,
  ADD COLUMN IF NOT EXISTS architect text;

UPDATE public.opportunities
SET model = 'Capri',
    sqft_total = 2317,
    sqft_living = 1715,
    bedrooms = 3,
    bathrooms = 2,
    study = 1,
    garage = 'Yes',
    constructor = 'Growup Investments',
    architect = 'Olympus Designs Group'
WHERE name ILIKE '%329 NE 13th%';