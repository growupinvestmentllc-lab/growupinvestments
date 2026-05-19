ALTER TABLE public.project_documents DROP CONSTRAINT IF EXISTS project_documents_doc_type_check;
ALTER TABLE public.project_documents ADD CONSTRAINT project_documents_doc_type_check
  CHECK (doc_type IN ('contrato_construccion','assignment_beneficiary','buyer','due_diligence','joint_venture','warranty_deed','structural_plan','ledger_balance'));

INSERT INTO public.project_documents (project_id, category, doc_type, llc_name)
SELECT id, 'legal', 'ledger_balance', NULL FROM public.projects
ON CONFLICT (project_id, doc_type, llc_name) DO NOTHING;