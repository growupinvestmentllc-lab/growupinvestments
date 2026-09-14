UPDATE public.project_stages SET estimated_start_date = CASE stage_group
    WHEN 'Soft Construction' THEN DATE '2026-08-01'
    WHEN 'Hard Construction 1' THEN DATE '2026-09-01'
    WHEN 'Hard Construction 2' THEN DATE '2026-10-01'
    WHEN 'Hard Construction 3' THEN DATE '2026-11-01'
    WHEN 'Hard Construction 4' THEN DATE '2026-12-01'
    WHEN 'CO (Certificado de Ocupación)' THEN DATE '2027-01-01'
  END,
  estimated_end_date = CASE stage_group
    WHEN 'Soft Construction' THEN DATE '2026-08-31'
    WHEN 'Hard Construction 1' THEN DATE '2026-09-30'
    WHEN 'Hard Construction 2' THEN DATE '2026-10-31'
    WHEN 'Hard Construction 3' THEN DATE '2026-11-30'
    WHEN 'Hard Construction 4' THEN DATE '2026-12-31'
    WHEN 'CO (Certificado de Ocupación)' THEN DATE '2027-01-31'
  END
WHERE project_id = 'ed024506-b782-401f-9fd6-6c6691430a0c';