CREATE OR REPLACE FUNCTION public.ensure_project_documents(_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  _llc1 text;
  _llc2 text;
begin
  select owner_llc, owner_llc_2 into _llc1, _llc2 from public.projects where id = _project_id;

  insert into public.project_documents (project_id, category, doc_type, llc_name) values
    (_project_id,'legal','contrato_construccion',null),
    (_project_id,'legal','buyer',null),
    (_project_id,'legal','due_diligence',null),
    (_project_id,'legal','warranty_deed',null),
    (_project_id,'legal','ledger_balance',null),
    (_project_id,'construccion','structural_plan',null)
  on conflict (project_id, doc_type, llc_name) do nothing;

  if _llc1 is not null and length(trim(_llc1)) > 0 then
    insert into public.project_documents (project_id, category, doc_type, llc_name) values
      (_project_id,'legal','assignment_beneficiary',_llc1),
      (_project_id,'legal','joint_venture',_llc1)
    on conflict (project_id, doc_type, llc_name) do nothing;
  end if;

  if _llc2 is not null and length(trim(_llc2)) > 0 then
    insert into public.project_documents (project_id, category, doc_type, llc_name) values
      (_project_id,'legal','assignment_beneficiary',_llc2),
      (_project_id,'legal','joint_venture',_llc2)
    on conflict (project_id, doc_type, llc_name) do nothing;
  end if;
end; $function$;