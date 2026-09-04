UPDATE public.project_stages SET draw_amount = 0 WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5';

UPDATE public.project_stages SET draw_amount = 56500 WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Soft Construction' AND stage_order = (SELECT MIN(stage_order) FROM public.project_stages WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Soft Construction');

UPDATE public.project_stages SET draw_amount = 53000 WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Hard Construction 1' AND stage_order = (SELECT MIN(stage_order) FROM public.project_stages WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Hard Construction 1');

UPDATE public.project_stages SET draw_amount = 53000 WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Hard Construction 2' AND stage_order = (SELECT MIN(stage_order) FROM public.project_stages WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Hard Construction 2');

UPDATE public.project_stages SET draw_amount = 53000 WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Hard Construction 3' AND stage_order = (SELECT MIN(stage_order) FROM public.project_stages WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Hard Construction 3');

UPDATE public.project_stages SET draw_amount = 39750 WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Hard Construction 4' AND stage_order = (SELECT MIN(stage_order) FROM public.project_stages WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'Hard Construction 4');

UPDATE public.project_stages SET draw_amount = 13250 WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'CO (Certificado de Ocupación)' AND stage_order = (SELECT MIN(stage_order) FROM public.project_stages WHERE project_id = '37a42318-5951-4acf-a585-ea24ac3badc5' AND stage_group = 'CO (Certificado de Ocupación)');

UPDATE public.projects SET lot_cost = 23500, updated_at = now() WHERE id = '37a42318-5951-4acf-a585-ea24ac3badc5';