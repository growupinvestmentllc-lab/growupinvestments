
-- documents table
create table public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  category text not null check (category in ('legal','construccion')),
  doc_type text not null check (doc_type in (
    'contrato_construccion','assignment_beneficiary','buyer','due_diligence',
    'joint_venture','warranty_deed','structural_plan'
  )),
  llc_name text,
  file_path text,
  file_name text,
  uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, doc_type, llc_name)
);

alter table public.project_documents enable row level security;

create policy "admins manage docs" on public.project_documents for all to authenticated
  using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));

create policy "investor sees own docs" on public.project_documents for select to authenticated
  using (
    exists (select 1 from public.projects p where p.id = project_documents.project_id
      and (p.investor_id = auth.uid()
           or p.owner_llc = current_user_llc()
           or p.owner_llc_2 = current_user_llc()))
    and (
      project_documents.llc_name is null
      or project_documents.llc_name = current_user_llc()
    )
  );

-- seed function
create or replace function public.ensure_project_documents(_project_id uuid)
returns void language plpgsql security definer set search_path = public as $$
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
end; $$;

create or replace function public.tg_ensure_project_documents()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.ensure_project_documents(new.id);
  return new;
end; $$;

create trigger ensure_docs_after_insert
  after insert on public.projects
  for each row execute function public.tg_ensure_project_documents();

create trigger ensure_docs_after_owner_update
  after update of owner_llc, owner_llc_2 on public.projects
  for each row execute function public.tg_ensure_project_documents();

-- backfill all existing projects
do $$
declare r record;
begin
  for r in select id from public.projects loop
    perform public.ensure_project_documents(r.id);
  end loop;
end $$;

-- storage bucket
insert into storage.buckets (id, name, public) values ('project-documents','project-documents', false)
on conflict (id) do nothing;

create policy "admins manage doc files" on storage.objects for all to authenticated
  using (bucket_id = 'project-documents' and has_role(auth.uid(),'admin'))
  with check (bucket_id = 'project-documents' and has_role(auth.uid(),'admin'));

create policy "users read own doc files" on storage.objects for select to authenticated
  using (
    bucket_id = 'project-documents'
    and exists (
      select 1 from public.project_documents d
      where d.file_path = storage.objects.name
        and (
          has_role(auth.uid(),'admin')
          or exists (
            select 1 from public.projects p where p.id = d.project_id
              and (p.investor_id = auth.uid()
                   or p.owner_llc = current_user_llc()
                   or p.owner_llc_2 = current_user_llc())
              and (d.llc_name is null or d.llc_name = current_user_llc())
          )
        )
    )
  );
