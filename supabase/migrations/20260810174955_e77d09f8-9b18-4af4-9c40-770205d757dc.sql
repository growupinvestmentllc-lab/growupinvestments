UPDATE public.project_stages ps SET estimated_start_date = m.s, estimated_end_date = m.e, estimated_date = m.s
FROM (VALUES
 ('Soft Construction','2026-07-01'::date,'2026-07-31'::date),
 ('Hard Construction 1','2026-08-01','2026-08-31'),
 ('Hard Construction 2','2026-09-01','2026-09-30'),
 ('Hard Construction 3','2026-10-01','2026-10-31'),
 ('Hard Construction 4','2026-11-01','2026-11-30'),
 ('CO (Certificate of Occupancy)','2026-12-01','2026-12-31')
) AS m(g,s,e)
WHERE ps.project_id='8d0d7f4b-7d03-43a6-849a-1e3fe060df6c' AND ps.stage_group=m.g;

UPDATE public.project_stages SET active = (stage_group='Hard Construction 1')
WHERE project_id='8d0d7f4b-7d03-43a6-849a-1e3fe060df6c' AND completed = false;