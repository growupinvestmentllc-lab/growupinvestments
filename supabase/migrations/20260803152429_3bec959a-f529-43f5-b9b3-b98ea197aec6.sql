UPDATE public.project_documents
SET file_path = 'a300bb26-1f20-4d85-8e8a-8c83474c084b/contrato_construccion.pdf',
    file_name = 'Contrato de Construccion 2812.pdf',
    uploaded_at = now()
WHERE id = 'da77f30a-e98b-4edf-9fa1-1b74e6039000';

DELETE FROM public.project_documents WHERE id = 'f78761b9-dc73-402e-afa6-e9aa0fb511a2';