DELETE FROM public.project_documents pd
USING public.projects p
WHERE pd.project_id = p.id
  AND (
    p.address ILIKE '%2725 Embers%'
    OR p.address ILIKE '%710 Jaguar%'
    OR p.address ILIKE '%Sun N Lake%'
  )
  AND (pd.doc_type <> 'structural_plan' OR pd.file_path IS NULL OR pd.file_path = '');