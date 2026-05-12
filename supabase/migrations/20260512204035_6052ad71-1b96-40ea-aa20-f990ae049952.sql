insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true);
create policy "public read project-images" on storage.objects for select using (bucket_id = 'project-images');
create policy "auth upload project-images" on storage.objects for insert to authenticated with check (bucket_id = 'project-images');