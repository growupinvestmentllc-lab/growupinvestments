ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS construction_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lot_cost numeric DEFAULT 0;