DELETE FROM public.project_documents d USING (
  SELECT id, row_number() OVER (PARTITION BY project_id, doc_type ORDER BY (file_path IS NULL), created_at) rn
  FROM public.project_documents
  WHERE project_id = 'c2ebeec8-3b95-476d-9e3f-bc8982520091' AND doc_type = 'structural_plan'
) x WHERE d.id = x.id AND x.rn > 1;