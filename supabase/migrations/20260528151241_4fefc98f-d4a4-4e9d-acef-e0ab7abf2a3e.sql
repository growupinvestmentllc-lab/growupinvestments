UPDATE public.project_stages
SET completed = true, active = false
WHERE project_id = (SELECT id FROM public.projects WHERE address ILIKE '%710 Jaguar%' LIMIT 1)
  AND stage_group = 'Hard Construction 1';

UPDATE public.project_stages
SET active = true, completed = false
WHERE project_id = (SELECT id FROM public.projects WHERE address ILIKE '%710 Jaguar%' LIMIT 1)
  AND stage_order = 8;