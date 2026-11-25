-- Apply after the categories migration (003). Safe to rerun.
begin;

-- Index the referencing columns so the integrity check also works efficiently on large workspaces.
create index if not exists mly_notes_workspace_category
 on public.mly_workspace_notes(workspace_id,category);

-- Enforce new references and protect existing categories even when a publish races deletion.
-- Leave historical rows intact if a deployment has legacy assignments without a category row.
do $$
begin
 if not exists (
   select 1 from pg_constraint
   where conrelid='public.mly_workspace_notes'::regclass and conname='mly_notes_workspace_category_fk'
 ) then
   alter table public.mly_workspace_notes add constraint mly_notes_workspace_category_fk
     foreign key (workspace_id,category) references public.mly_workspace_categories(workspace_id,name) not valid;
 end if;
end $$;

create or replace function public.mly_delete_workspace_category(p_workspace uuid,p_name text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform 1 from public.mly_workspaces where id=p_workspace and owner_id=auth.uid() for update;
 if not found then
   raise exception 'Workspace owner required' using errcode='42501';
 end if;
 if p_name is null or length(p_name) not between 1 and 120 then
   raise exception 'Invalid category name' using errcode='22023';
 end if;
 delete from public.mly_workspace_categories where workspace_id=p_workspace and name=p_name;
end $$;

revoke all on function public.mly_delete_workspace_category(uuid,text) from public,anon,authenticated;
grant execute on function public.mly_delete_workspace_category(uuid,text) to authenticated;
commit;
